#!/usr/bin/env node

/**
 * Direct CLI tool to generate React components from Figma designs
 * Usage: node generate-component.js <figma-url> [component-name]
 */

import 'dotenv/config';
import { FigmaService } from './mcp-server/dist/services/figma-service.js';
import { FigmaExtractor } from './mcp-server/dist/services/figma-extractor.js';
import { ReactGenerator } from './mcp-server/dist/services/react-generator.js';
import { DatabaseService } from './mcp-server/dist/services/db-service.js';

async function generateComponent(figmaUrl, componentName) {
  const startTime = Date.now();

  console.log('🚀 Starting React component generation...\n');

  // Check environment variables
  const requiredEnvVars = [
    'FIGMA_ACCESS_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'ANTHROPIC_API_KEY'
  ];

  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nAdd them to your .env file or export them.');
    process.exit(1);
  }

  try {
    // Step 1: Fetch Figma design
    console.log('📥 Fetching Figma design...');
    const figmaService = new FigmaService(process.env.FIGMA_ACCESS_TOKEN);
    const { fileKey, nodeId } = figmaService.parseFigmaUrl(figmaUrl);

    let figmaNode;
    if (nodeId) {
      figmaNode = await figmaService.getNode(fileKey, nodeId);
    } else {
      const file = await figmaService.getFile(fileKey);
      figmaNode = file.document;
    }

    console.log(`✓ Fetched: ${figmaNode.name}\n`);

    // Step 2: Store in database
    console.log('💾 Storing design in database...');
    const db = new DatabaseService(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const designId = await db.storeFigmaDesign({
      figma_url: figmaUrl,
      file_key: fileKey,
      node_id: nodeId,
      design_name: figmaNode.name,
      raw_data: figmaNode,
    });

    console.log(`✓ Design stored (ID: ${designId})\n`);

    // Step 3: Extract design data
    console.log('🔍 Analyzing design...');
    const extractor = new FigmaExtractor();
    const designData = extractor.extractDesignData(figmaNode);

    console.log(`✓ Found ${designData.metadata.totalComponents} elements`);
    console.log(`✓ Complexity: ${designData.metadata.complexity}`);
    console.log(`✓ Colors: ${Object.keys(designData.designTokens.colors).length}`);
    console.log(`✓ Spacing values: ${designData.designTokens.spacing.length}\n`);

    // Step 4: Generate React component
    console.log('🤖 Generating React component with AI...');
    const generator = new ReactGenerator(process.env.ANTHROPIC_API_KEY);
    const generatedComponent = await generator.generateComponent(designData, {
      componentName: componentName,
      includeTypeScript: true,
      includeComments: false,
    });

    console.log(`✓ Generated: ${generatedComponent.componentName}\n`);

    // Step 5: Store generated component
    console.log('💾 Storing generated component...');
    const componentId = await db.storeGeneratedComponent({
      figma_design_id: designId,
      component_name: generatedComponent.componentName,
      component_code: generatedComponent.componentCode,
      props_interface: generatedComponent.propsInterface,
      imports: generatedComponent.imports,
      dependencies: generatedComponent.dependencies,
      ai_model: generatedComponent.metadata.aiModel,
      generation_prompt: generatedComponent.metadata.generationPrompt,
      metadata: {
        designTokens: designData.designTokens,
        complexity: designData.metadata.complexity,
      },
    });

    const generationTime = Date.now() - startTime;

    await db.storeGenerationHistory({
      figma_design_id: designId,
      generated_component_id: componentId,
      success: true,
      generation_time_ms: generationTime,
    });

    console.log(`✓ Component stored (ID: ${componentId})\n`);

    // Step 6: Output results
    console.log('═'.repeat(60));
    console.log('✨ GENERATED COMPONENT');
    console.log('═'.repeat(60));
    console.log();
    console.log(generatedComponent.componentCode);
    console.log();
    console.log('═'.repeat(60));
    console.log('📊 GENERATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Component Name: ${generatedComponent.componentName}`);
    console.log(`Generation Time: ${generationTime}ms`);
    console.log(`AI Model: ${generatedComponent.metadata.aiModel}`);
    console.log(`Complexity: ${designData.metadata.complexity}`);
    console.log(`Dependencies: ${generatedComponent.dependencies.join(', ')}`);
    console.log();
    console.log('💡 Next steps:');
    console.log('1. Copy the code above');
    console.log('2. Save to: src/components/' + generatedComponent.componentName + '.tsx');
    console.log('3. Install dependencies: npm install ' + generatedComponent.dependencies.join(' '));
    console.log('4. Import and use in your app!');
    console.log();

    // Save to file (optional)
    const fs = await import('fs/promises');
    const outputPath = `./generated/${generatedComponent.componentName}.tsx`;
    await fs.mkdir('./generated', { recursive: true });
    await fs.writeFile(outputPath, generatedComponent.componentCode);
    console.log(`💾 Saved to: ${outputPath}`);

  } catch (error) {
    const generationTime = Date.now() - startTime;
    console.error('\n❌ Generation failed:', error.message);
    console.error(`Time elapsed: ${generationTime}ms`);
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node generate-component.js <figma-url> [component-name]');
  console.log();
  console.log('Example:');
  console.log('  node generate-component.js "https://www.figma.com/design/ABC/Design?node-id=1-2"');
  console.log('  node generate-component.js "https://www.figma.com/design/ABC/Design?node-id=1-2" MyButton');
  process.exit(0);
}

const [figmaUrl, componentName] = args;
generateComponent(figmaUrl, componentName);
