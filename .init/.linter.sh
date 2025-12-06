#!/bin/bash
cd /home/kavia/workspace/code-generation/collaboratepro-platform-287208-287218/node_apollo_graphql_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

