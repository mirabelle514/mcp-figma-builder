interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  characters?: string;
  style?: any;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

interface FigmaFile {
  name: string;
  document: FigmaNode;
}

export class FigmaService {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getFile(fileKey: string): Promise<FigmaFile> {
    const response = await fetch(`${this.baseUrl}/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getNode(fileKey: string, nodeId: string): Promise<FigmaNode> {
    const cleanNodeId = nodeId.replace(':', '-');

    const response = await fetch(
      `${this.baseUrl}/files/${fileKey}/nodes?ids=${cleanNodeId}`,
      {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const nodeData = data.nodes[cleanNodeId];

    if (!nodeData || !nodeData.document) {
      throw new Error(`Node ${nodeId} not found in file`);
    }

    return nodeData.document;
  }

  async getFileNodes(fileKey: string, nodeIds: string[]): Promise<Record<string, FigmaNode>> {
    const cleanNodeIds = nodeIds.map(id => id.replace(':', '-'));
    const idsParam = cleanNodeIds.join(',');

    const response = await fetch(
      `${this.baseUrl}/files/${fileKey}/nodes?ids=${idsParam}`,
      {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const nodes: Record<string, FigmaNode> = {};

    for (const [nodeId, nodeData] of Object.entries(data.nodes as Record<string, any>)) {
      if (nodeData && nodeData.document) {
        nodes[nodeId] = nodeData.document;
      }
    }

    return nodes;
  }

  parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } {
    const fileKeyMatch = url.match(/file\/([a-zA-Z0-9]+)/);
    if (!fileKeyMatch) {
      throw new Error('Invalid Figma URL: Could not extract file key');
    }

    const fileKey = fileKeyMatch[1];

    const nodeIdMatch = url.match(/node-id=([^&]+)/);
    const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]) : undefined;

    return { fileKey, nodeId };
  }
}
