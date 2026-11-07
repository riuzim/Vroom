// Vroom Release TDP Workflow
// Usa workflow tool para orquestrar release dev -> main

export const meta = {
  name: 'vroom-release-tdp',
  description: 'Release workflow for Vroom dev to main with tests and versioning'
};

export async function run({ agent }) {
  await agent('Checkout dev e pull', 'git checkout dev && git pull');
  await agent('Testes', 'pnpm -r test');
  await agent('Lint', 'pnpm lint');
  await agent('Version guard check', 'node scripts/version-guard.js');
  await agent('Commit e push dev', 'git commit-push');
  await agent('Merge para main', 'git checkout main && git merge dev');
  await agent('Push main', 'git push origin main');
  await agent('Criar tag', 'git tag v${GAME_VERSION} && git push origin --tags');
}
