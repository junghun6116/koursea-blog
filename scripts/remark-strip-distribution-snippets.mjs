const DISTRIBUTION_HEADING = 'social & community distribution snippets';

function textContent(node) {
  if (typeof node?.value === 'string') return node.value;
  return Array.isArray(node?.children) ? node.children.map(textContent).join('') : '';
}

export default function remarkStripDistributionSnippets() {
  return (tree) => {
    if (!Array.isArray(tree?.children)) return;

    const distributionIndex = tree.children.findIndex(
      (node) => node.type === 'heading'
        && node.depth === 2
        && textContent(node).trim().toLowerCase() === DISTRIBUTION_HEADING
    );

    if (distributionIndex >= 0) tree.children.splice(distributionIndex);
  };
}
