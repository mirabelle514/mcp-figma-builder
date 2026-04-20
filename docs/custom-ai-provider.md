# Custom AI Provider Guide (Mode 4)

##  Overview

Mode 4 allows you to connect the tool to your company's **internal/private AI infrastructure** instead of using public AI services like Anthropic or OpenAI.

**Perfect for:**
- Companies with internal AI tools (e.g., CompanyAI, InternalAI)
- Enterprises requiring data sovereignty
- Teams with private ChatGPT deployments
- Organizations with security/compliance requirements

---

##  Features

-  Use your internal AI infrastructure
-  Full data privacy and control
-  OpenAI-compatible API format
-  Same features as Modes 2/3
-  Custom naming and branding
-  Flexible model selection

---

##  Requirements

### Your AI Service Must:

1. **Be OpenAI-compatible**
   - Accept requests in OpenAI chat completion format
   - Return responses in OpenAI format
   - Support `messages`, `model`, `max_tokens`, `temperature` parameters

2. **Have an accessible endpoint**
   - HTTP/HTTPS URL accessible from where MCP server runs
   - Could be internal network (VPN) or public with auth

3. **Provide authentication**
   - API key or bearer token
   - Standard `Authorization: Bearer <token>` header

---

##  Configuration

### Step 1: Use the Setup Wizard

1. Run `npm run dev` and open `http://localhost:5173`
2. **Choose Mode 4** "Custom AI Provider"
3. Enter your configuration:
   - **AI Name**: `CompanyAI` (or your AI's name)
   - **API URL**: `https://ai.yourcompany.com/v1/chat/completions`
   - **API Key**: Your internal API key
   - **Model** (optional): `gpt-4` or your model name

4. Download the generated config

### Step 2: Manual Configuration

Edit your Claude Desktop config:

```json
{
  "mcpServers": {
    "component-figma": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_...",
        "SUPABASE_URL": "https://...",
        "SUPABASE_ANON_KEY": "eyJ...",
        "REPO_OWNER": "your-org",
        "REPO_NAME": "your-repo",

        "CUSTOM_AI_PROVIDER": "true",
        "CUSTOM_AI_URL": "https://ai.yourcompany.com/v1/chat/completions",
        "CUSTOM_AI_KEY": "your-internal-api-key",
        "CUSTOM_AI_NAME": "CompanyAI",
        "CUSTOM_AI_MODEL": "gpt-4"
      }
    }
  }
}
```

---

##  Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CUSTOM_AI_PROVIDER` |  Yes | Enable custom AI | `"true"` |
| `CUSTOM_AI_URL` |  Yes | API endpoint URL | `https://ai.company.com/v1/chat/completions` |
| `CUSTOM_AI_KEY` |  Yes | API authentication key | `your-api-key-here` |
| `CUSTOM_AI_NAME` |  Optional | Display name for logs | `"CompanyAI"` |
| `CUSTOM_AI_MODEL` |  Optional | Default model name | `"gpt-4"` |

---

##  API Format

### Request Format (What We Send)

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Generate a React component..."
    }
  ],
  "max_tokens": 4096,
  "temperature": 0.7
}
```

### Response Format (What We Expect)

```json
{
  "id": "chatcmpl-123",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "import React from 'react'..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 800,
    "total_tokens": 950
  }
}
```

**Your API must accept the request format and return the response format shown above.**

---

##  Common Setups

### Setup 1: Internal ChatGPT Deployment

If your company has deployed ChatGPT internally:

```json
"CUSTOM_AI_URL": "https://chatgpt.internal.company.com/v1/chat/completions",
"CUSTOM_AI_KEY": "internal-api-key-from-admin",
"CUSTOM_AI_MODEL": "gpt-4"
```

### Setup 2: Azure OpenAI

If using Azure OpenAI:

```json
"CUSTOM_AI_URL": "https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2024-02-15-preview",
"CUSTOM_AI_KEY": "your-azure-key",
"CUSTOM_AI_MODEL": "gpt-4"
```

**Note:** Azure requires `api-key` header instead of `Bearer` token. See customization section below.

### Setup 3: Self-Hosted LLM (vLLM, Text Generation WebUI)

If using self-hosted models with OpenAI-compatible APIs:

```json
"CUSTOM_AI_URL": "http://internal-llm-server:8000/v1/chat/completions",
"CUSTOM_AI_KEY": "any-value-if-no-auth",
"CUSTOM_AI_MODEL": "mistral-7b"
```

---

##  Security Best Practices

### 1. Network Security
- Use HTTPS in production
- Consider VPN for internal endpoints
- Implement IP whitelisting if possible

### 2. API Key Management
- Rotate keys regularly
- Use read-only keys when possible
- Never commit keys to git
- Use environment-specific keys

### 3. Access Control
- Limit key permissions
- Log all API usage
- Monitor for unusual activity
- Implement rate limiting

---

##  Testing Your Setup

### Test 1: Verify Configuration

After setting up, test in Claude Desktop:

```
Generate a simple React button component from scratch
```

### Test 2: Check Logs

The MCP server logs will show:

```
[CompanyAI] Generated 1234 characters
[CompanyAI] Tokens: 150 prompt + 800 completion = 950 total
```

### Test 3: Validate Output

Generated code should:
- Import your component library
- Be properly formatted
- Match your Figma design
- Use TypeScript (if enabled)

---

## 🐛 Troubleshooting

### Problem: "Failed to generate completion"

**Possible causes:**
1. Wrong API URL
2. Invalid API key
3. Network connectivity issue
4. API format mismatch

**Solutions:**
1. Verify URL is correct and accessible
2. Test API key with curl:
   ```bash
   curl -X POST https://your-api-url \
     -H "Authorization: Bearer your-key" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hello"}]}'
   ```
3. Check firewall/VPN settings
4. Verify API returns OpenAI-compatible format

### Problem: "No AI provider configured"

**Cause:** `CUSTOM_AI_PROVIDER` not set to `"true"`

**Solution:** Check your Claude Desktop config has:
```json
"CUSTOM_AI_PROVIDER": "true"
```

### Problem: Authentication errors

**Cause:** API expects different auth format

**Solution:** You may need to customize the authentication in `custom-ai-provider.ts`:

```typescript
// For Azure-style auth
headers: {
  'api-key': this.apiKey,  // instead of Authorization header
  'Content-Type': 'application/json',
}
```

### Problem: Model not found

**Cause:** Model name doesn't match your deployment

**Solution:** Check your AI service's available models and update `CUSTOM_AI_MODEL`

---

##  Customization

If your API differs from OpenAI format, you can customize:

**File:** `mcp-server/src/services/custom-ai-provider.ts`

### Custom Headers

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${this.apiKey}`,
  'X-Custom-Header': 'value',  // Add custom headers
}
```

### Custom Request Format

```typescript
body: JSON.stringify({
  model,
  messages,
  max_tokens: maxTokens,
  temperature,
  // Add custom fields
  your_custom_field: 'value',
})
```

### Custom Response Parsing

```typescript
const content = data.choices[0].message.content;

// Or for custom format:
const content = data.your_custom_response_field;
```

---

##  Pro Tips

1. **Start with public API first**
   - Test with Anthropic (Mode 2) or OpenAI (Mode 3) first
   - Verify everything works
   - Then switch to your custom AI

2. **Test API independently**
   - Use Postman or curl to test your API
   - Verify request/response format
   - Then configure the tool

3. **Monitor usage**
   - Track API calls and costs
   - Set up alerts for failures
   - Review generated code quality

4. **Keep backup config**
   - Save working configs
   - Document any customizations
   - Version control your setup

---

##  Comparison: Custom AI vs Public AI

| Aspect | Custom AI (Mode 4) | Anthropic (Mode 2) | OpenAI (Mode 3) |
|--------|-------------------|-------------------|-----------------|
| **Data Privacy** |  Full control |  Sent to Anthropic |  Sent to OpenAI |
| **Setup Complexity** |  More complex |  Simple |  Simple |
| **Cost** |  Your pricing |  ~$5-20/project |  ~$10-30/project |
| **Availability** |  Your uptime |  High |  High |
| **Customization** |  Full control |  Limited |  Limited |
| **Compliance** |  Your rules |  Anthropic terms |  OpenAI terms |

---

##  Example: Custom AI Setup

### Scenario
Your company has an internal AI tool called "CompanyAI" powered by ChatGPT:

```
URL: https://ai.yourcompany.com/v1/chat/completions
Auth: Bearer token from IT team
Model: gpt-4
```

### Configuration

```json
{
  "mcpServers": {
    "component-figma": {
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_...",
        "SUPABASE_URL": "https://...",
        "SUPABASE_ANON_KEY": "eyJ...",
        "REPO_OWNER": "your-company",
        "REPO_NAME": "design-system",

        "CUSTOM_AI_PROVIDER": "true",
        "CUSTOM_AI_URL": "https://ai.yourcompany.com/v1/chat/completions",
        "CUSTOM_AI_KEY": "your-api-key-from-it",
        "CUSTOM_AI_NAME": "CompanyAI",
        "CUSTOM_AI_MODEL": "gpt-4"
      }
    }
  }
}
```

### Usage

1. Scan your component repo
2. Generate from Figma
3. Check logs for `[CompanyAI]` messages
4. Verify generated code uses your components

---

##  Getting Started Checklist

- [ ] Contact your AI team for endpoint and credentials
- [ ] Test API with curl/Postman
- [ ] Verify OpenAI-compatible format
- [ ] Configure using setup wizard OR manual config
- [ ] Restart Claude Desktop
- [ ] Test with simple component generation
- [ ] Verify logs show your AI name
- [ ] Check generated code quality
- [ ] Document your setup for team

---

##  Additional Resources

- **Setup Wizard**: `npm run dev` → http://localhost:5173
- **Code**: `mcp-server/src/services/custom-ai-provider.ts`
- **Examples**: See customization section above
- **Support**: Check main README.md troubleshooting

---

##  FAQ

**Q: Does my AI need to be ChatGPT/GPT-4?**
A: No! Any model that accepts OpenAI-compatible requests works. Could be Llama, Mistral, Claude (via Bedrock), etc.

**Q: Can I use multiple custom AIs?**
A: Currently one at a time. You can switch by changing config and restarting Claude Desktop.

**Q: What if my API format is different?**
A: Customize `custom-ai-provider.ts` to match your format. See customization section.

**Q: Is this secure?**
A: Yes, as secure as your internal AI infrastructure. Data never leaves your network if using internal endpoints.

**Q: Can I use this with Azure OpenAI?**
A: Yes! See "Common Setups" section for Azure configuration example.

**Q: What about on-premises LLMs?**
A: Absolutely! Works with vLLM, Text Generation WebUI, or any OpenAI-compatible server.

---

**Mode 4 gives you complete control over your AI infrastructure while maintaining all the benefits of automated component generation!** 
