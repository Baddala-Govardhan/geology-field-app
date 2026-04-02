#!/bin/sh
# Instructor-only Fauxton gate (nginx auth_basic). Runs before nginx loads config.
set -e
USER="${FAUXTON_BASIC_USER:-app}"
PASS="${FAUXTON_BASIC_PASSWORD:-app}"
htpasswd -bc /etc/nginx/.fauxton_htpasswd "$USER" "$PASS"
chmod 644 /etc/nginx/.fauxton_htpasswd
