# Org-owned agents: identity, delegation, dispatch

How a company-owned agent is provisioned so it speaks and acts as the org, and the checks that stop a
working setup from being "fixed" into a different shape.

## Who owns what

| Thing | Owner |
|---|---|
| Company voice, announcements, org listings | the org profile |
| Company agents (`proofcaster`, `proofable-reviewer`) | the org wallet, controlled by the org |
| The founder's own agents (legal, investor, growth, audit, dev, creative) | the founder wallet, controlled by the founder |

The split is a product requirement. A company agent on the founder wallet makes every public action
look like the founder acting personally, and moving one there to satisfy an internal check is the
correction the owner has had to make more than once.

## Two surfaces that are easy to conflate

- **The hosted agent page and its route are public.** `https://proofable.me/agent/<agentId>` answers 200
  for anyone. That is the link the owner has already sent to people. It says nothing about privacy.
- **The agent-identity proof record is a separate object** with its own `privacyLevel`. A public page can
  sit over a private record.

So "is this agent public" is two questions. Answer them separately, and never report the page state as
the record state or the reverse.

## The chain dispatch actually reads

`protocol/src/utils/delegation-utils.js`, `assertAgentJobAuthority`:

1. **Ownership.** Controller equals the agent wallet, or `ownerOperatesWallet(controller, agent)` from
   `protocol/src/utils/owner-trusted-wallets.js`, which derives the wallets an owner operates from
   `wallet-link` and `agent-delegation` association proofs. The owner-primary, linked-wallet model already
   exists here. It does not need a new record type.
2. **The delegation,** looked up as a controller plus agent pair.
3. **The identity,** `findActiveAgentIdentityProof(storage, agentWallet, agentId)`, read by the agent wallet
   with `activeOnly`.
4. Allowed only when both resolve. `SETUP_REQUIRED` means the delegation resolved and the identity did not.

A private identity on another account is the usual reason step 3 returns null while the delegation is
fine. The code states the rule in its own comment: only a public agent runs for someone else.

## Provisioning, in order

1. Decide the owner before the first write. Controller changes are not edits.
2. `proofable_agent_create` with `agentId`, `agentWallet` and `controllerWallet` both set to the owning
   wallet, plus `preset`, `capabilities`, and an instructions body a stranger may read.
3. Read it back with `proofable_agent_link` and confirm `linked: true`.
4. Only then schedule. The roster in `proofable_context` → `profileContext.agents[]` must show the agentId
   with `delegationActive: true` and `execute_jobs` in `allowedActions`.

## Pitfalls

- **A denial can outlive the grant by one resolution window.** `job_create` returns `DELEGATION_REQUIRED`,
  then `SETUP_REQUIRED`, then succeeds on identical arguments once the delegation reaches the roster. Re-read
  the roster and retry the same call once; do not change arguments between attempts and do not add a second
  grant. Never report a platform gap before the roster shows the grant active and the call still fails.
- **An identity edit is not a create.** Re-creating with new `instructions` came back with the original text
  every time. The stored identity body is edited in the profile UI, not through the tool.
- **Do not diagnose by mutating.** Each retry writes a durable record the owner then has to read back.
