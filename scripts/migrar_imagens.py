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

import cloudscraper
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

BATCH_SIZE = 20
DELAY = 0.3


SUPABASE_URL: str = ""
SUPABASE_KEY: str = ""


def conectar():
    global SUPABASE_URL, SUPABASE_KEY
    SUPABASE_URL = (os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "").strip("\"'")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip("\"'")
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def criar_bucket(supabase: Client) -> None:
    try:
        supabase.storage.create_bucket("assets", {"public": True})
        print("✅ Bucket 'assets' criado")
    except Exception as e:
        msg = str(e).lower()
        if "already exists" in msg or "duplicate" in msg:
            print("✅ Bucket 'assets' já existe")
        else:
            print(f"⚠️  {e}")


def baixar(scraper, url: str) -> bytes | None:
    if not url or "sofascore" not in url.lower():
        return None
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Referer": "https://www.sofascore.com/",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    }
    for tentativa in range(3):
        try:
            resp = scraper.get(url, headers=headers, timeout=30)
            ct = (resp.headers.get("content-type") or "").lower()
            if resp.status_code == 200 and ("image" in ct or "octet" in ct):
                return resp.content
            if resp.status_code == 403:
                print(f"    ⛔ 403: {url.rsplit('/', 1)[-1]}")
            elif resp.status_code == 404:
                print(f"    ❌ 404: {url.rsplit('/', 1)[-1]}")
            else:
                print(f"    ⚠️  HTTP {resp.status_code}: {url.rsplit('/', 1)[-1]}")
            return None
        except Exception as e:
            if tentativa < 2:
                time.sleep(2 ** tentativa)
                continue
            print(f"    ❌ Erro: {e}")
            return None
    return None


def upload(supabase: Client, caminho: str, conteudo: bytes) -> str | None:
    bucket_url = f"{SUPABASE_URL}/storage/v1/object/public/assets"
    url_final = f"{bucket_url}/{caminho}"
    try:
        supabase.storage.from_("assets").upload(
            caminho, conteudo,
            {"content-type": "image/png", "upsert": "true"}
        )
        return url_final
    except Exception as e:
        msg = str(e).lower()
        if "duplicate" in msg or "already exists" in msg or "row level security" in msg:
            supabase.storage.from_("assets").update(
                caminho, conteudo,
                {"content-type": "image/png"}
            )
            return url_final
        print(f"    ❌ Upload {caminho}: {e}")
        return None


def progresso(atual: int, total: int, ok: int, prefixo: str = "") -> None:
    if (atual) % BATCH_SIZE == 0 or atual == total:
        print(f"    {prefixo}{atual}/{total} — {ok} ok")


def migrar_jogadores(supabase: Client, scraper) -> None:
    dados = supabase.table("jogadores").select("id_sofascore, foto_url").execute().data
    pendentes = [j for j in dados if j.get("foto_url") and "sofascore" in j["foto_url"].lower()]
    ja_migrados = [j for j in dados if j.get("foto_url", "").startswith(SUPABASE_URL)]
    print(f"  {len(pendentes)} pendentes, {len(ja_migrados)} já migrados")

    ok = 0
    for i, j in enumerate(pendentes, 1):
        jid = j["id_sofascore"]
        conteudo = baixar(scraper, j["foto_url"])
        if conteudo:
            nova_url = upload(supabase, f"jogadores/{jid}.png", conteudo)
            if nova_url:
                supabase.table("jogadores").update({"foto_url": nova_url}).eq("id_sofascore", jid).execute()
                ok += 1
        progresso(i, len(pendentes), ok)
        time.sleep(DELAY)

    print(f"  ✅ {ok}/{len(pendentes)} fotos migradas")


def migrar_bandeiras(supabase: Client, scraper) -> None:
    dados = supabase.table("selecoes").select("id, bandeira_url").execute().data
    pendentes = [s for s in dados if s.get("bandeira_url") and "sofascore" in s["bandeira_url"].lower()]
    ja_migrados = [s for s in dados if s.get("bandeira_url", "").startswith(SUPABASE_URL)]
    print(f"  {len(pendentes)} pendentes, {len(ja_migrados)} já migrados")

    ok = 0
    for i, s in enumerate(pendentes, 1):
        sid = s["id"]
        conteudo = baixar(scraper, s["bandeira_url"])
        if conteudo:
            nova_url = upload(supabase, f"bandeiras/{sid}.png", conteudo)
            if nova_url:
                supabase.table("selecoes").update({"bandeira_url": nova_url}).eq("id", sid).execute()
                ok += 1
        progresso(i, len(pendentes), ok)
        time.sleep(DELAY)

    print(f"  ✅ {ok}/{len(pendentes)} bandeiras migradas")


def main():
    print("\n" + "=" * 50)
    print("  MIGRAÇÃO DE IMAGENS → SUPABASE STORAGE")
    print("=" * 50)

    supabase = conectar()
    print(f"📦 Storage: {SUPABASE_URL}/storage/v1/object/public/assets")

    criar_bucket(supabase)

    scraper = cloudscraper.create_scraper()

    print("\n📸 Jogadores...")
    migrar_jogadores(supabase, scraper)

    print("\n🏳️ Bandeiras...")
    migrar_bandeiras(supabase, scraper)

    print("\n🏁 Pronto!")


if __name__ == "__main__":
    main()
