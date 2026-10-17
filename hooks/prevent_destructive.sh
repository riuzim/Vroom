#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Hook de defesa contra comandos Git destrutivos
# ---------------------------------------------------------------------------
# Executar antes de qualquer comando Git. Aborta (exit 1) se detectar
# um subcomando destrutivo ou uma flag perigosa.
#
# Subcomandos bloqueados:
#   reset, revert, clean, checkout, merge, rebase, push, filter-branch
# Flags bloqueadas em qualquer subcomando:
#   --hard, --force, --amend, -D
# ---------------------------------------------------------------------------

set -uo pipefail

FORBIDDEN=("reset" "revert" "clean" "checkout" "merge" "rebase" "push" "filter-branch")
DANGEROUS_FLAGS=("--hard" "--force" "--amend" "-D")

for cmd in "${FORBIDDEN[@]}"; do
    if [[ $* =~ (^|[[:space:]])$cmd([[:space:]]|$) ]]; then
        echo "Locked: blocked Git subcommand: $cmd"
        echo "If you really need it, run it yourself: git $*"
        exit 1
    fi
done

for flag in "${DANGEROUS_FLAGS[@]}"; do
    if [[ $* == *"$flag"* ]]; then
        echo "Locked: blocked dangerous Git flag: $flag"
        echo "If you really need it, run it yourself: git $*"
        exit 1
    fi
done

# Nada proibido encontrado: libera a execucao
exit 0
