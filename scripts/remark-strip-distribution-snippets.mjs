const DISTRIBUTION_HEADING = 'social & community distribution snippets';

function textContent(node) {
  if (typeof node?.value === 'string') return node.value;
  return Array.isArray(node?.children) ? node.children.map(textContent).join('') : '';
}

export default function remarkStripDistributionSnippets() {
  return (tree) => {
    if (!Array.isArray(tree?.children)) return;

    // PostLayout owns the only page-level H1. Older source files keep their
    // editorial H1 in Markdown, but it must not render below metadata/TOC.
    const bodyTitleIndex = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 1);
    if (bodyTitleIndex >= 0) tree.children.splice(bodyTitleIndex, 1);

    const distributionIndex = tree.children.findIndex(
      (node) => node.type === 'heading'
        && node.depth === 2
        && textContent(node).trim().toLowerCase() === DISTRIBUTION_HEADING
    );

    if (distributionIndex >= 0) tree.children.splice(distributionIndex);
  };
}
