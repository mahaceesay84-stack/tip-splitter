# REVIEW-LOG.md · the tip splitter

## A. Spec

### Inputs

- Bill (`.bill-input`): dalasi, decimal. Blank/non-numeric = 0.
- Tip presets (`.tip-preset` ×5) and custom (`.tip-custom`): whichever the user touches last is the active percentage; touching one clears the other's selected/highlighted look. Custom percentage is trusted as typed — no clamping, so negative or over-100 values compute literally.
- People (`.people-input`): must be a positive integer. Blank or 0 is invalid.

### Validation

- Invalid people -> red border on the people field, "Can't be zero" line shown, money outputs held at D0.00, remainder hidden.
- Valid people -> normal computation, error hidden.
- Blank/untouched people field stays visually quiet (no error UI) but still counts as invalid: outputs hold at D0.00.

### Money (bututs, integer math, no floats)

- tip = round(bill_bututs × pct / 100)
- total = bill_bututs + tip
- per_person = floor(total / people)
- remainder = total − (per_person × people)

### Outputs

Update live on every keystroke/click; `.out-tip`, `.out-total`, `.out-person` formatted as `D0.00`.

### Remainder line

Hidden when people invalid or remainder is 0; otherwise shown. Exact wording decided during diff review, not pinned here — must state which person pays extra and how much.

### Reset

Clears every field/selection back to defaults; button itself is disabled whenever the form is already at defaults.

## B. Diffs

| # | What it proposed | Decision | Why |
|---|---|---|---|
| 1 | Wire bill + people inputs into a central `update()` that computes total and per-person (tip hard-coded at D0.00), with people validation and Reset disabled when nothing entered. | Amended | As proposed, a blank untouched people field immediately showed "Can't be zero", contradicting the kept decision that the error waits until the field is touched. Changed so blank stays visually quiet while still treated as invalid (outputs hold at D0.00); also required a positive integer, not merely any number > 0, per spec. |
| 2 | Wire the five tip presets and the custom field with last-touched-wins: touching one clears the other's highlight and value; custom percentage trusted as typed, no clamping. | Accepted | Implements the confirmed exclusivity rule exactly, and no-clamping matches the decision that the JS trusts the typed percentage literally. |
| 3 | Remainder-line wording: "One person pays N butut(s) (D0.0N) extra so the split covers the whole bill." shown only when the split is uneven. | Accepted | States who pays the extra and how much, which is all the spec pinned down; singular/plural handled; hidden when the split divides evenly. |
| 4 | Wire Reset to clear every field and selection, and disable it whenever the form is already at defaults. | Accepted | Matches the confirmed disabled-at-defaults rule; after a reset the page is indistinguishable from a fresh load. |

## C. QA

Run headlessly against the real page: the actual `index.html` + `js/app.js` loaded into a real DOM, driven with real `input`/`click` events, outputs and classes read back from the DOM.

| Input | Expected | Happened |
|---|---|---|
| Fresh load, untouched | All outputs D0.00, remainder hidden, error hidden, Reset disabled | Exact match |
| Bill 142.55, 15% preset, 3 people | Tip D21.38, total D163.93, each D54.64, remainder "1 butut (D0.01) extra" | Exact match |
| 10% preset selected, then custom 20 typed | Preset highlight clears, tip recalculates to D20.00 (last-touched wins) | Exact match |
| People set to 0 | Red border + "Can't be zero" shown, per-person held at D0.00 | Exact match |
| People blanked after being valid, then Reset | No error while blank; Reset clears every field and disables itself | Exact match |
| Bill 90, custom 10%, 3 people | Total D99.00, each D33.00 exactly, remainder stays hidden | Exact match |
