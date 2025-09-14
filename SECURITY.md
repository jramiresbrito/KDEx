# Security Guidelines for KDEx

This document outlines security practices for managing dependencies and protecting against supply chain attacks in the KDEx project.

## 🚨 Recent Threat Context

On September 8, 2025, a major npm supply chain attack compromised popular packages including `debug@4.4.2` and `chalk@5.6.1`. The attack specifically targeted cryptocurrency applications by hijacking wallet transactions. **Reference**: https://www.wiz.io/blog/widespread-npm-supply-chain-attack-breaking-down-impact-scope-across-debug-chalk

## 🔒 Security Measures Implemented

### 1. Strict Dependency Management
- **Exact versions only**: `.npmrc` configured with `save-exact=true`
- **Engine enforcement**: `engine-strict=true` ensures Node.js ≥18.0.0, npm ≥10
- **Registry lock**: Only allows packages from official npm registry
- **Package-lock required**: Ensures reproducible builds

### 2. Automated Security Checks
```bash
# Run security audit
npm run security:check

# Check for malicious packages  
npm run security:deps

# Audit with fix suggestions (dry-run)
npm run security:audit:fix
```

### 3. Pre-install Protection
- Automatic security checks before any `npm install`
- Blocks known malicious package versions
- Validates Node.js and npm versions
- Warns about dangerous flags (`--force`, `--ignore-scripts`)

## 🛡️ Best Practices for Developers

### Before Installing New Dependencies

1. **Research the package**:
   - Check GitHub stars, maintenance status, and recent issues
   - Verify the maintainer's identity and reputation
   - Look for typosquatting (e.g., `recat` instead of `react`)

2. **Run security checks**:
   ```bash
   npm run security:check
   npm audit --audit-level=moderate
   ```

3. **Install with caution**:
   ```bash
   # Good - specific version
   npm install package-name@1.2.3
   
   # Avoid - range versions in production
   npm install package-name@^1.2.0
   ```

### When Updating Dependencies

1. **Never use `--force`** without understanding the risks
2. **Always review changes**:
   ```bash
   npm run security:update  # Shows what would be updated
   npm update --dry-run     # Preview changes
   ```
3. **Test thoroughly** after updates
4. **Update package-lock.json** and commit it

### Emergency Response (Supply Chain Attack)

If a malicious package is discovered:

1. **Immediate actions**:
   ```bash
   # Check if affected
   npm run security:deps
   
   # Clear all caches
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **For frontend builds**:
   - Invalidate CDN cache
   - Rebuild and redeploy applications
   - Check for malicious code in bundled assets

3. **For wallet interactions**:
   - Temporarily disable crypto features
   - Review recent transactions for anomalies
   - Force re-authentication for wallet flows

## 📋 Known Malicious Packages (Blocklist)

The following package versions are known to be malicious and are blocked by our security scripts:

- `debug@4.4.2`
- `chalk@5.6.1`  
- `ansi-styles@6.2.2`
- `supports-color@10.2.1`
- `strip-ansi@7.1.1`
- `wrap-ansi@9.0.1`
- `ansi-regex@6.2.1`
- `color-convert@3.1.1`
- `slice-ansi@7.1.1`
- `color-name@2.0.1`
- `@duckdb/*@1.3.3`
- And others (see `scripts/check-deps.js`)

## 🔧 Security Configuration Files

### `.npmrc`
- Enforces exact versions and engine requirements
- Enables automatic security audits
- Restricts to official npm registry

### `scripts/check-deps.js`
- Scans for known malicious packages
- Detects typosquatting attempts
- Validates package integrity

### `scripts/pre-install-security.js`
- Pre-installation security validation
- Blocks dangerous operations
- Enforces environment requirements

## 🚀 CI/CD Security

For production deployments:

```bash
# In your CI pipeline
npm ci --audit-level=moderate
npm run security:check
npm run build
```

## 📞 Incident Response

If you suspect a compromise:

1. **Stop all deployments**
2. **Run security checks**: `npm run security:check`
3. **Check transaction logs** for unusual activity
4. **Review recent dependency changes**
5. **Contact the team immediately**

## 🔄 Regular Maintenance

- **Weekly**: Run `npm audit` and review results
- **Before releases**: Full security check with `npm run security:check`
- **Monthly**: Review and update this security documentation
- **Stay informed**: Monitor security advisories and npm blog

## 📚 Additional Resources

- [npm Security Best Practices](https://docs.npmjs.com/security)
- [Node.js Security Guidelines](https://nodejs.org/en/security)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [Wiz Threat Center](https://app.wiz.io/boards/threat-center)

---

**Remember**: In cryptocurrency applications, a single compromised dependency can lead to stolen funds. Always err on the side of caution.
