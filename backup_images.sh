#!/bin/bash

# Script zum Backup von Original-Bildern vom Server
# Usage: ./backup_originals.sh [YEAR]
# Example: ./backup_originals.sh 2023

# Jahr als Parameter (Standard: aktuelles Jahr)
YEAR=${1:-$(date +%Y)}

# Konfiguration
SERVER_USER="xccup"
SERVER_HOST="xccup.net"
SERVER_PORT="55220"
SSH_KEY="~/.ssh/id_xcup"
REMOTE_IMAGE_DIR="~/xccup.net/data/images/flights/${YEAR}"
LOCAL_DOWNLOAD_DIR="$HOME/Downloads"

# Dateinamen
ARCHIVE_NAME="originals_${YEAR}.tar.gz"
REMOTE_ARCHIVE="~/tmp_${ARCHIVE_NAME}"

echo "=========================================="
echo "Backup Original-Bilder für Jahr: ${YEAR}"
echo "=========================================="

# 1. Auf dem Server: Bilder finden und komprimieren
echo ""
echo "Schritt 1: Suche und komprimiere Bilder auf dem Server..."
ssh -p ${SERVER_PORT} -i ${SSH_KEY} ${SERVER_USER}@${SERVER_HOST} << EOF
  cd ${REMOTE_IMAGE_DIR}
  
  echo "Suche Original-Bilder aus ${YEAR}..."
  FILE_COUNT=\$(find . -type f \
    \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) \
    ! -name "*-thumb.*" \
    ! -name "*-xsmall.*" \
    ! -name "*-small.*" \
    ! -name "*-regular.*" \
    ! -name "*_resize.*" \
    -newermt "${YEAR}-01-01" ! -newermt "$((YEAR+1))-01-01" \
    | wc -l)
  
  echo "Gefunden: \${FILE_COUNT} Bilder"
  
  if [ "\${FILE_COUNT}" -eq 0 ]; then
    echo "Keine Bilder gefunden für Jahr ${YEAR}"
    exit 1
  fi
  
  echo "Erstelle Archiv..."
  find . -type f \
    \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.webp" \) \
    ! -name "*-thumb.*" \
    ! -name "*-xsmall.*" \
    ! -name "*-small.*" \
    ! -name "*-regular.*" \
    ! -name "*_resize.*" \
    -newermt "${YEAR}-01-01" ! -newermt "$((YEAR+1))-01-01" \
    -print0 | tar -czf ~/${ARCHIVE_NAME} --null -T -
  
  echo "Archiv erstellt: ~/${ARCHIVE_NAME}"
  ls -lh ~/${ARCHIVE_NAME}
EOF

if [ $? -ne 0 ]; then
  echo "Fehler beim Erstellen des Archivs auf dem Server"
  exit 1
fi

# 2. Archiv vom Server herunterladen
echo ""
echo "Schritt 2: Lade Archiv herunter..."
scp -P ${SERVER_PORT} -i ${SSH_KEY} ${SERVER_USER}@${SERVER_HOST}:~/${ARCHIVE_NAME} ${LOCAL_DOWNLOAD_DIR}

if [ $? -ne 0 ]; then
  echo "Fehler beim Download des Archivs"
  exit 1
fi

# 3. Archiv auf dem Server löschen
echo ""
echo "Schritt 3: Räume Server auf..."
ssh -p ${SERVER_PORT} -i ${SSH_KEY} ${SERVER_USER}@${SERVER_HOST} "rm ~/${ARCHIVE_NAME}"

echo ""
echo "=========================================="
echo "✓ Backup erfolgreich abgeschlossen!"
echo "Datei: ${LOCAL_DOWNLOAD_DIR}/${ARCHIVE_NAME}"
echo "=========================================="
ls -lh ${LOCAL_DOWNLOAD_DIR}/${ARCHIVE_NAME}
