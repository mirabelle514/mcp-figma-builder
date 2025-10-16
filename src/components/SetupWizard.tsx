import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Download,
  Copy,
  ExternalLink,
  AlertCircle,
  Github,
  Figma,
  Zap,
  Database,
  Code2,
  Sparkles,
  Brain
} from 'lucide-react';

type Step = 'mode' | 'repo' | 'figma' | 'database' | 'ai' | 'generate' | 'complete';
type AIMode = 'none' | 'anthropic' | 'openai' | 'custom';

interface Config {
  mode: AIMode;
  repoOwner: string;
  repoName: string;
  figmaToken: string;
  supabaseUrl: string;
  supabaseKey: string;
  githubToken: string;
  anthropicKey: string;
  openaiKey: string;
  customAiUrl: string;
  customAiKey: string;
  customAiName: string;
  customAiModel: string;
}

export function SetupWizard() {
  const [currentStep, setCurrentStep] = useState<Step>('mode');
  const [config, setConfig] = useState<Config>({
    mode: 'none',
    repoOwner: 'elastic',
    repoName: 'eui',
    figmaToken: '',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    githubToken: '',
    anthropicKey: '',
    openaiKey: '',
    customAiUrl: '',
    customAiKey: '',
    customAiName: 'LibertyGPT',
    customAiModel: 'gpt-4',
  });
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});
  const [copied, setCopied] = useState(false);

  const steps: { id: Step; title: string; icon: React.ReactNode }[] = [
    { id: 'mode', title: 'Choose Mode', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'repo', title: 'Repository', icon: <Github className="w-5 h-5" /> },
    { id: 'figma', title: 'Figma Access', icon: <Figma className="w-5 h-5" /> },
    { id: 'database', title: 'Database', icon: <Database className="w-5 h-5" /> },
    { id: 'ai', title: 'AI Provider', icon: <Brain className="w-5 h-5" /> },
    { id: 'generate', title: 'Generate Config', icon: <Code2 className="w-5 h-5" /> },
    { id: 'complete', title: 'Complete', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const generateConfigJson = () => {
    const isMac = true;
    const path = isMac
      ? '/absolute/path/to/project/mcp-server/dist/index.js'
      : 'C:\\absolute\\path\\to\\project\\mcp-server\\dist\\index.js';

    const env: Record<string, string> = {
      FIGMA_ACCESS_TOKEN: config.figmaToken,
      SUPABASE_URL: config.supabaseUrl,
      SUPABASE_ANON_KEY: config.supabaseKey,
      LUMIERE_REPO_OWNER: config.repoOwner,
      LUMIERE_REPO_NAME: config.repoName,
    };

    if (config.githubToken) {
      env.GITHUB_TOKEN = config.githubToken;
    }

    if (config.mode === 'anthropic' && config.anthropicKey) {
      env.ANTHROPIC_API_KEY = config.anthropicKey;
    }

    if (config.mode === 'openai' && config.openaiKey) {
      env.OPENAI_API_KEY = config.openaiKey;
    }

    if (config.mode === 'custom') {
      env.CUSTOM_AI_PROVIDER = 'true';
      if (config.customAiUrl) env.CUSTOM_AI_URL = config.customAiUrl;
      if (config.customAiKey) env.CUSTOM_AI_KEY = config.customAiKey;
      if (config.customAiName) env.CUSTOM_AI_NAME = config.customAiName;
      if (config.customAiModel) env.CUSTOM_AI_MODEL = config.customAiModel;
    }

    return JSON.stringify({
      mcpServers: {
        'component-figma': {
          command: 'node',
          args: [path],
          env,
        },
      },
    }, null, 2);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(generateConfigJson());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadConfig = () => {
    const blob = new Blob([generateConfigJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claude_desktop_config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'mode':
        return true;
      case 'repo':
        return config.repoOwner && config.repoName;
      case 'figma':
        return config.figmaToken.length > 0;
      case 'database':
        return config.supabaseUrl && config.supabaseKey;
      case 'ai':
        if (config.mode === 'none') return true;
        if (config.mode === 'anthropic') return config.anthropicKey.length > 0;
        if (config.mode === 'openai') return config.openaiKey.length > 0;
        if (config.mode === 'custom') return config.customAiUrl.length > 0 && config.customAiKey.length > 0;
        return false;
      case 'generate':
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Setup Wizard
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Figma to Component Library Generator
          </h1>
          <p className="text-lg text-slate-600">
            Generate React components using YOUR actual component library
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      index < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      index <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
          {/* Mode Selection */}
          {currentStep === 'mode' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Mode</h2>
              <p className="text-slate-600 mb-6">
                Select how you want to generate components
              </p>

              <div className="space-y-4">
                <ModeCard
                  title="Mode 1: Component Mapping Only"
                  description="Free - Matches Figma designs to your component library. No AI required."
                  cost="$0/month"
                  selected={config.mode === 'none'}
                  onClick={() => setConfig({ ...config, mode: 'none' })}
                  features={[
                    'Match Figma to components',
                    'Implementation guides',
                    'No API costs',
                    'Manual coding required'
                  ]}
                />

                <ModeCard
                  title="Mode 2: AI with Anthropic Claude"
                  description="Generates complete React code using your component library with Claude 3.5 Sonnet."
                  cost="~$5-20/project"
                  selected={config.mode === 'anthropic'}
                  onClick={() => setConfig({ ...config, mode: 'anthropic' })}
                  features={[
                    'All Mode 1 features',
                    'AI code generation',
                    'Uses YOUR components',
                    'Claude 3.5 Sonnet'
                  ]}
                />

                <ModeCard
                  title="Mode 3: AI with OpenAI GPT-4"
                  description="Generates complete React code using your component library with GPT-4o."
                  cost="~$10-30/project"
                  selected={config.mode === 'openai'}
                  onClick={() => setConfig({ ...config, mode: 'openai' })}
                  features={[
                    'All Mode 1 features',
                    'AI code generation',
                    'Uses YOUR components',
                    'GPT-4o'
                  ]}
                />

                <ModeCard
                  title="Mode 4: Custom AI Provider (e.g., LibertyGPT)"
                  description="Connect to your company's internal AI tool. Ideal for enterprises with private AI infrastructure."
                  cost="Your pricing"
                  selected={config.mode === 'custom'}
                  onClick={() => setConfig({ ...config, mode: 'custom' })}
                  features={[
                    'All Mode 1 features',
                    'AI code generation',
                    'Use private AI tools',
                    'Full control & security'
                  ]}
                />
              </div>
            </div>
          )}

          {/* Repository Configuration */}
          {currentStep === 'repo' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Configure Repository</h2>
              <p className="text-slate-600 mb-6">
                Which component library repository do you want to use?
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Repository Owner
                  </label>
                  <input
                    type="text"
                    value={config.repoOwner}
                    onChange={(e) => setConfig({ ...config, repoOwner: e.target.value })}
                    placeholder="elastic"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={config.repoName}
                    onChange={(e) => setConfig({ ...config, repoName: e.target.value })}
                    placeholder="eui"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    GitHub Token (optional - only for private repos)
                  </label>
                  <input
                    type="password"
                    value={config.githubToken}
                    onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                    placeholder="ghp_..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Get token from:{' '}
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      GitHub Settings
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Popular Examples:</p>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>• Elastic EUI: <code className="bg-blue-100 px-1 rounded">elastic / eui</code></p>
                    <p>• Material-UI: <code className="bg-blue-100 px-1 rounded">mui / material-ui</code></p>
                    <p>• Ant Design: <code className="bg-blue-100 px-1 rounded">ant-design / ant-design</code></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Figma Configuration */}
          {currentStep === 'figma' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Figma Access Token</h2>
              <p className="text-slate-600 mb-6">
                Connect to your Figma account to analyze designs
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Figma Access Token
                  </label>
                  <input
                    type="password"
                    value={config.figmaToken}
                    onChange={(e) => setConfig({ ...config, figmaToken: e.target.value })}
                    placeholder="figd_..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Get your token from:{' '}
                    <a
                      href="https://www.figma.com/settings"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Figma Settings → Personal access tokens
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-1">How to get your token:</p>
                      <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                        <li>Go to Figma Settings</li>
                        <li>Scroll to "Personal access tokens"</li>
                        <li>Click "Generate new token"</li>
                        <li>Copy and paste it here</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Configuration */}
          {currentStep === 'database' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Database Configuration</h2>
              <p className="text-slate-600 mb-6">
                Supabase is used to store component data and generation history
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Supabase URL
                  </label>
                  <input
                    type="text"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig({ ...config, supabaseUrl: e.target.value })}
                    placeholder="https://xxx.supabase.co"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    value={config.supabaseKey}
                    onChange={(e) => setConfig({ ...config, supabaseKey: e.target.value })}
                    placeholder="eyJ..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-1">Already configured!</p>
                      <p className="text-sm text-green-700">
                        These values are auto-loaded from your project's .env file.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Provider Configuration */}
          {currentStep === 'ai' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Provider Setup</h2>
              <p className="text-slate-600 mb-6">
                {config.mode === 'none'
                  ? 'No AI provider needed for Mode 1'
                  : config.mode === 'anthropic'
                  ? 'Configure Anthropic Claude for AI code generation'
                  : config.mode === 'openai'
                  ? 'Configure OpenAI GPT-4 for AI code generation'
                  : 'Configure your custom AI provider (e.g., LibertyGPT)'
                }
              </p>

              {config.mode === 'none' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-slate-700 font-medium">No AI configuration needed</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Mode 1 provides component mapping without AI generation
                  </p>
                </div>
              ) : config.mode === 'anthropic' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Anthropic API Key
                    </label>
                    <input
                      type="password"
                      value={config.anthropicKey}
                      onChange={(e) => setConfig({ ...config, anthropicKey: e.target.value })}
                      placeholder="sk-ant-..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Get your key from:{' '}
                      <a
                        href="https://console.anthropic.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Anthropic Console
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Pricing:</p>
                    <p className="text-sm text-blue-700">
                      Claude 3.5 Sonnet: $3 per million input tokens, $15 per million output tokens.
                      Typical component generation: $0.10-0.50 per component.
                    </p>
                  </div>
                </div>
              ) : config.mode === 'openai' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={config.openaiKey}
                      onChange={(e) => setConfig({ ...config, openaiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Get your key from:{' '}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        OpenAI Platform
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Pricing:</p>
                    <p className="text-sm text-blue-700">
                      GPT-4o: $2.50 per million input tokens, $10 per million output tokens.
                      Typical component generation: $0.15-0.60 per component.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Custom AI Name
                    </label>
                    <input
                      type="text"
                      value={config.customAiName}
                      onChange={(e) => setConfig({ ...config, customAiName: e.target.value })}
                      placeholder="LibertyGPT"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      The name of your internal AI tool (e.g., LibertyGPT, CompanyAI)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      API Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={config.customAiUrl}
                      onChange={(e) => setConfig({ ...config, customAiUrl: e.target.value })}
                      placeholder="https://your-company-ai.internal/v1/chat/completions"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      The full URL to your AI's chat completions endpoint
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      API Key / Token
                    </label>
                    <input
                      type="password"
                      value={config.customAiKey}
                      onChange={(e) => setConfig({ ...config, customAiKey: e.target.value })}
                      placeholder="your-api-key-here"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Get this from your internal AI team or admin panel
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Model Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={config.customAiModel}
                      onChange={(e) => setConfig({ ...config, customAiModel: e.target.value })}
                      placeholder="gpt-4"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      The model name to use (e.g., gpt-4, gpt-3.5-turbo). Leave as default if unsure.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-900 mb-2">Custom AI Requirements:</p>
                        <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                          <li>API must be OpenAI-compatible (same request/response format)</li>
                          <li>Endpoint should accept chat completion requests</li>
                          <li>Contact your AI team for the correct endpoint and credentials</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Example Configuration:</p>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>• <strong>Name:</strong> LibertyGPT</p>
                      <p>• <strong>URL:</strong> https://liberty-ai.yourcompany.com/v1/chat/completions</p>
                      <p>• <strong>Model:</strong> gpt-4 (or whatever your internal model is called)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Configuration */}
          {currentStep === 'generate' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate Configuration</h2>
              <p className="text-slate-600 mb-6">
                Your Claude Desktop configuration is ready! Copy or download it.
              </p>

              <div className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-4 relative">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    {generateConfigJson()}
                  </pre>
                  <button
                    onClick={handleCopyConfig}
                    className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCopyConfig}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Copy className="w-5 h-5" />
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={handleDownloadConfig}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Download File
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-2">Important: Update the path!</p>
                      <p className="text-sm text-amber-700 mb-2">
                        Before using this config, replace the placeholder path with your actual project path:
                      </p>
                      <code className="text-xs bg-amber-100 px-2 py-1 rounded block">
                        /absolute/path/to/project/mcp-server/dist/index.js
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete */}
          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Setup Complete!</h2>
              <p className="text-lg text-slate-600 mb-8">
                Your configuration is ready. Follow these final steps:
              </p>

              <div className="bg-slate-50 rounded-lg p-6 text-left space-y-6 max-w-2xl mx-auto">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">1. Build the MCP Server</h3>
                  <code className="block bg-slate-900 text-green-400 px-4 py-2 rounded text-sm">
                    cd mcp-server && npm install && npm run build
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">2. Install Configuration</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Place your configuration file at:
                  </p>
                  <code className="block bg-slate-900 text-green-400 px-4 py-2 rounded text-sm">
                    ~/Library/Application Support/Claude/claude_desktop_config.json
                  </code>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">3. Restart Claude Desktop</h3>
                  <p className="text-sm text-slate-600">
                    Completely quit and reopen Claude Desktop (not just close the window)
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">4. Test It!</h3>
                  <p className="text-sm text-slate-600 mb-2">In Claude Desktop, try:</p>
                  <div className="space-y-2">
                    <code className="block bg-slate-900 text-green-400 px-4 py-2 rounded text-sm">
                      Scan the {config.repoName} repository
                    </code>
                    <code className="block bg-slate-900 text-green-400 px-4 py-2 rounded text-sm">
                      Generate a React component from [YOUR_FIGMA_URL]
                    </code>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-3">
                  Need help? Check out the documentation:
                </p>
                <div className="flex flex-wrap gap-3 justify-center text-xs">
                  <a
                    href="https://github.com/yourusername/yourrepo/blob/main/docs/USER_GUIDE.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    📚 User Guide
                  </a>
                  <a
                    href="https://github.com/yourusername/yourrepo/blob/main/docs/TROUBLESHOOTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors"
                  >
                    🔧 Troubleshooting
                  </a>
                  <a
                    href="https://github.com/yourusername/yourrepo/blob/main/docs/SETUP_WIZARD.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-slate-50 text-slate-700 rounded hover:bg-slate-100 transition-colors"
                  >
                    ⚙️ Setup Details
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                const prevIndex = currentStepIndex - 1;
                if (prevIndex >= 0) {
                  setCurrentStep(steps[prevIndex].id);
                }
              }}
              disabled={currentStepIndex === 0}
              className="px-6 py-2 text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              ← Back
            </button>

            <button
              onClick={() => {
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < steps.length) {
                  setCurrentStep(steps[nextIndex].id);
                }
              }}
              disabled={!canProceed() || currentStepIndex === steps.length - 1}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {currentStepIndex === steps.length - 2 ? 'Finish' : 'Continue'} →
            </button>
          </div>
        </div>

        {/* Help Footer */}
        <div className="text-center mt-8 text-sm text-slate-600">
          <p className="mb-2">Having trouble?</p>
          <div className="flex flex-wrap gap-3 justify-center text-xs">
            <a
              href="https://github.com/yourusername/yourrepo/blob/main/docs/USER_GUIDE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
            >
              📚 User Guide
            </a>
            <a
              href="https://github.com/yourusername/yourrepo/blob/main/docs/TROUBLESHOOTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
            >
              🔧 Troubleshooting
            </a>
            <a
              href="https://github.com/yourusername/yourrepo/blob/main/docs/CUSTOM_AI_PROVIDER.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors inline-flex items-center gap-1"
            >
              🤖 Custom AI Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModeCardProps {
  title: string;
  description: string;
  cost: string;
  selected: boolean;
  onClick: () => void;
  features: string[];
}

function ModeCard({ title, description, cost, selected, onClick, features }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
        selected
          ? 'border-blue-600 bg-blue-50 shadow-lg scale-[1.02]'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className="ml-4">
          {selected ? (
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          ) : (
            <Circle className="w-6 h-6 text-slate-300" />
          )}
        </div>
      </div>
      <div className="mb-3">
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
          {cost}
        </span>
      </div>
      <ul className="space-y-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}
