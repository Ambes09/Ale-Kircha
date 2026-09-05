#!/bin/bash

# ... (copy test-all.sh content, then fix port detection)

# Replace netstat with ss for Termux
# Change: netstat -tln 2>/dev/null | grep -q ":4000"
# To:     ss -tln 2>/dev/null | grep -q ":4000" || lsof -i :4000 2>/dev/null | grep -q LISTEN
