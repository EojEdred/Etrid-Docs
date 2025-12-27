# START HERE - AI Monitoring Agent Deployment Package

**Status:** Ready for Deployment
**Created:** 2025-11-01
**Target:** 15 Remaining Validator VMs
**Primary Server:** VM #10 (98.71.91.84)

---

## Path Assumptions

- `ETRID_DOCS=/Users/macbook/Desktop/etrid-workspace/etrid-docs`
- `MONITORING_ROOT` points to the external monitoring repo that contains:
  - `deploy-monitoring-agents-parallel.sh`
  - `ai-monitoring/` (agent sources)

---

## What You're Deploying

You now have a complete, production-ready deployment package for rolling out lightweight monitoring agents to 15 validator VMs. All agents will report to the central monitoring server on VM #10.

### Quick Facts
- **Duration:** 15-25 minutes deployment + 30-45 minutes verification
- **Risk:** Low (easily reversible, no impact on validators)
- **Prerequisites:** VM #10 operational, SSH key available
- **Cost:** $0 for agents, $56/month for Claude API on VM #10
- **Complexity:** Fully automated (single script)

---

## Documentation Files

| File | Size | Purpose | Read Time |
|------|------|---------|-----------|
| `docs/deployment/*(NEEDTOUPDATE)START_HERE.md` | This file | Navigation guide | 5 min |
| `docs/deployment/*(needtoUpdate)AGENT_DEPLOYMENT_GUIDE.md` | Deployment guide | 15 min |
| `docs/deployment/*(needtoupdate)AGENTDEPLOYMENTCHECKLIST.md` | Checklist | 10 min |


---

## Deployment in 3 Steps

### Step 1: Verify VM #10 (5 minutes)
```bash
ssh -i ~/.ssh/etrid_vm1 compiler-dev01@98.71.91.84 "systemctl status prometheus"
```
Should show "active (running)"

### Step 2: Run Deployment (20 minutes)
```bash
bash "$MONITORING_ROOT/deploy-monitoring-agents-parallel.sh"
```

### Step 3: Verify Success (10 minutes)
```bash
cat /tmp/etrid-deployment-report.txt
curl http://98.71.91.84:9090/api/v1/targets | jq '.data.activeTargets | length'
```

Expected: 15 agents reporting

---


---

## Prerequisites Checklist

Before you start:
- [ ] VM #10 (98.71.91.84) is operational
- [ ] SSH key exists: `~/.ssh/etrid_vm1`
- [ ] SSH works: `ssh -i ~/.ssh/etrid_vm1 compiler-dev01@98.71.91.84 "echo OK"`
- [ ] Network connectivity to all 15 VMs
- [ ] ~1 hour available (including verification)

---

## What Gets Installed

**On Each of 15 VMs:**
- Node Exporter - System metrics collector
- Python Agent - Reports to VM #10
- Systemd Service - Auto-restart

**Impact per VM:**
- Disk: ~500 MB
- Memory: +100 MB
- CPU: <2%
- Cost: $0

---

## Success Indicators

You'll know it worked when:
✓ Script finishes with green checkmarks
✓ Deployment report: ≥13/15 "SUCCESS"
✓ Manual verification passes on sample VMs
✓ VM #10 receives metrics from agents
✓ Agents keep running for 30+ minutes

---

## Key Files

| File | Purpose |
|------|---------|
| `deploy-monitoring-agents-parallel.sh` | Main deployment script (external repo) |
| `docs/deployment/*(needtoUpdate)AGENT_DEPLOYMENT_GUIDE.md` | Complete documentation |
| `docs/deployment/*(needtoupdate)AGENTDEPLOYMENTCHECKLIST.md` | Step-by-step verification |

---

## Common Issues

### SSH key not found
```bash
ls -la ~/.ssh/etrid_vm1
chmod 600 ~/.ssh/etrid_vm1
```

### Script won't run
```bash
chmod +x "$MONITORING_ROOT/deploy-monitoring-agents-parallel.sh"
```

### Agent not running on a VM
```bash
ssh -i ~/.ssh/etrid_vm1 <vm-address>
systemctl status etrid-agent
journalctl -u etrid-agent -n 50
```

---

## Next Steps

1. **Read** documentation (choose path above)
2. **Verify** all prerequisites
3. **Run** deployment script
4. **Monitor** progress
5. **Verify** success

---

## Help & Support

- **How to deploy:** `docs/deployment/*(needtoUpdate)AGENT_DEPLOYMENT_GUIDE.md`
- **Verification:** `docs/deployment/*(needtoupdate)AGENTDEPLOYMENTCHECKLIST.md`

---

**Status: Ready to Deploy**

**Start with:** 
Good luck!
