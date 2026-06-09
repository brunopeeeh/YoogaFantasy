#!/usr/bin/env python3
"""
Migra imagens do Sofascore CDN para o Supabase Storage.
Baixa fotos de jogadores e bandeiras e faz upload para o bucket 'assets'.

Uso:
  python scripts/migrar_imagens.py

Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env
"""

import os
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

from curl_cffi import requests as curl
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

MAX_WORKERS = 5
SOFASCORE_SEMAPHORE = threading.Semaphore(3)
PRINT_LOCK = threading.Lock()

SUPABASE_URL: str = ""
SUPABASE_KEY: str = ""


def log(msg: str) -> None:
    with PRINT_LOCK:
        print(msg)


def conectar():
    global SUPABASE_URL, SUPABASE_KEY
    SUPABASE_URL = (os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "").strip("\"'")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip("\"'")
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def criar_bucket() -> None:
    try:
        create_client(SUPABASE_URL, SUPABASE_KEY).storage.create_bucket("assets", {"public": True})
        log("✅ Bucket 'assets' criado")
    except Exception as e:
        msg = str(e).lower()
        if "already exists" in msg or "duplicate" in msg:
            log("✅ Bucket 'assets' já existe")
        else:
            log(f"⚠️  {e}")


def baixar(url: str) -> bytes | None:
    if not url or "sofascore" not in url.lower():
        return None
    for tentativa in range(3):
        try:
            resp = curl.get(url, headers={
                "Referer": "https://www.sofascore.com/",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
            }, timeout=30, impersonate="chrome120")
            ct = (resp.headers.get("content-type") or "").lower()
            if resp.status_code == 200 and ("image" in ct or "octet" in ct):
                return resp.content
            if resp.status_code == 403 and tentativa < 2:
                time.sleep(2 ** tentativa)
                continue
            return None
        except Exception:
            if tentativa < 2:
                time.sleep(2 ** tentativa)
                continue
            return None
    return None


def upload_single(caminho: str, conteudo: bytes) -> str | None:
    url = f"{SUPABASE_URL}/storage/v1/object/assets/{caminho}"
    url_final = f"{SUPABASE_URL}/storage/v1/object/public/assets/{caminho}"
    headers = {
        "authorization": f"Bearer {SUPABASE_KEY}",
        "content-type": "image/png",
        "x-upsert": "true",
    }
    try:
        resp = curl.put(url, data=conteudo, headers=headers, impersonate="chrome120", timeout=60)
        if resp.status_code in (200, 201):
            return url_final
        return None
    except Exception:
        return None


def processar_item(supabase, tabela: str, coluna_url: str, coluna_id: str, caminho_prefixo: str, item: dict) -> bool:
    item_id = item[coluna_id]
    origem = item[coluna_url]

    with SOFASCORE_SEMAPHORE:
        conteudo = baixar(origem)

    if not conteudo:
        return False

    nova_url = upload_single(f"{caminho_prefixo}/{item_id}.png", conteudo)
    if not nova_url:
        return False

    try:
        supabase.table(tabela).update({coluna_url: nova_url}).eq(coluna_id, item_id).execute()
        return True
    except Exception:
        return False


def migrar(tabela: str, coluna_id: str, coluna_url: str, caminho_prefixo: str, label: str) -> None:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    dados = []
    de = 0
    while True:
        batch = supabase.table(tabela).select(f"{coluna_id}, {coluna_url}").range(de, de + 999).execute().data
        if not batch:
            break
        dados.extend(batch)
        de += 1000
    pendentes = [d for d in dados if d.get(coluna_url) and "sofascore" in d[coluna_url].lower()]
    ja_feitos = [d for d in dados if d.get(coluna_url, "").startswith(SUPABASE_URL)]
    total = len(pendentes)
    log(f"  {label}: {total} pendentes, {len(ja_feitos)} já migrados")

    if not pendentes:
        return

    ok = 0
    erros = 0
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as exec:
        futuros = {
            exec.submit(processar_item, create_client(SUPABASE_URL, SUPABASE_KEY), tabela, coluna_url, coluna_id, caminho_prefixo, p): p
            for p in pendentes
        }

        log(f"    Iniciando {MAX_WORKERS} workers para {total} pendentes...")

        def _heartbeat():
            while not all(f.done() for f in futuros):
                ativos = sum(1 for f in futuros if f.running())
                prontos = sum(1 for f in futuros if f.done())
                log(f"    ⌛ {ativos} ativos, {prontos}/{total} concluídos — {ok} ok, {erros} erros")
                time.sleep(10)

        threading.Thread(target=_heartbeat, daemon=True).start()

        for i, futuro in enumerate(as_completed(futuros), 1):
            try:
                if futuro.result(timeout=120):
                    ok += 1
                else:
                    erros += 1
            except Exception:
                erros += 1
            if i % 20 == 0 or i == total:
                log(f"    {i}/{total} — {ok} ok, {erros} erros")

    log(f"  ✅ {ok}/{total} {label.lower()} migradas ({erros} erros)")


def main():
    print("\n" + "=" * 50)
    print("  MIGRAÇÃO DE IMAGENS → SUPABASE STORAGE")
    print("=" * 50)
    print(f"📦 Workers: {MAX_WORKERS}")
    print(f"📦 Storage: {SUPABASE_URL}/storage/v1/object/public/assets")

    conectar()
    criar_bucket()

    print("\n📸 Jogadores...")
    migrar("jogadores", "id_sofascore", "foto_url", "jogadores", "Jogadores")

    print("\n🏳️ Bandeiras...")
    migrar("selecoes", "id", "bandeira_url", "bandeiras", "Bandeiras")

    print("\n🏁 Pronto!")


if __name__ == "__main__":
    main()
