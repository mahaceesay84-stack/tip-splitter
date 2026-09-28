/* ============================================================
   Mini-project 1: the tip splitter.  THIS IS YOUR FILE.

   Money is tracked in bututs (integers) throughout and only
   formatted to "D0.00" strings on the way out to the DOM. This
   avoids floating-point drift on currency math.
   ============================================================ */

(function () {
  // ---- element references (Diff 1) ----
  var billInput = document.querySelector('.bill-input');
  var tipPresets = document.querySelectorAll('.tip-preset');
  var tipCustom = document.querySelector('.tip-custom');
  var peopleInput = document.querySelector('.people-input');
  var peopleField = document.querySelector('.field-people');
  var peopleError = document.querySelector('.people-error');
  var outTip = document.querySelector('.out-tip');
  var outTotal = document.querySelector('.out-total');
  var outPerson = document.querySelector('.out-person');
  var remainder = document.querySelector('.remainder');
  var resetBtn = document.querySelector('.reset');

  // ---- helpers: form values are always strings; money is bututs (Diff 1) ----
  function toBututs(value) {
    if (value === '') return 0;
    var n = Number(value);
    return isFinite(n) ? Math.round(n * 100) : 0;
  }

  function formatMoney(bututs) {
    var sign = bututs < 0 ? '-' : '';
    return 'D' + sign + (Math.abs(bututs) / 100).toFixed(2);
  }

  // Spec: people must be a positive integer. Blank or 0 is invalid.
  // Amended in review: blank/untouched stays quiet (no error UI), but
  // still counts as invalid for the outputs (held at D0.00).
  function peopleIsValid() {
    if (peopleInput.value === '') return false;
    var n = Number(peopleInput.value);
    return Number.isInteger(n) && n > 0;
  }

  // ---- tip state: last control touched wins (Diff 2) ----
  var tipSource = null; // 'preset' | 'custom' | null
  var tipPct = 0;

  function clearPresetSelection() {
    tipPresets.forEach(function (btn) {
      btn.classList.remove('is-selected');
    });
  }

  function selectPreset(btn) {
    clearPresetSelection();
    btn.classList.add('is-selected');
    tipCustom.value = '';
    tipSource = 'preset';
    tipPct = Number(btn.dataset.tip);
  }

  function applyCustomTip() {
    if (tipCustom.value === '') {
      // Custom cleared: nothing is active any more.
      tipSource = null;
      tipPct = 0;
      return;
    }
    // Spec: trusted as typed - no clamping, negatives and >100 compute literally.
    clearPresetSelection();
    tipSource = 'custom';
    tipPct = Number(tipCustom.value);
  }

  // ---- reset state (Diff 4) ----
  function isFormAtDefaults() {
    return (
      billInput.value === '' &&
      tipCustom.value === '' &&
      peopleInput.value === '' &&
      tipSource === null
    );
  }

  // ---- central recalc (Diff 1, extended by 2-4) ----
  function update() {
    var billBututs = toBututs(billInput.value);
    var valid = peopleIsValid();
    var people = valid ? Number(peopleInput.value) : 0;
    var touched = peopleInput.value !== '';

    if (valid || !touched) {
      peopleField.classList.remove('is-error');
      peopleError.classList.add('is-hidden');
    } else {
      peopleField.classList.add('is-error');
      peopleError.classList.remove('is-hidden');
    }

    var tipBututs = Math.round((billBututs * tipPct) / 100);
    var totalBututs = billBututs + tipBututs;
    var perPersonBututs = valid ? Math.floor(totalBututs / people) : 0;
    var remainderBututs = valid ? totalBututs - perPersonBututs * people : 0;

    outTip.textContent = formatMoney(tipBututs);
    outTotal.textContent = formatMoney(totalBututs);
    outPerson.textContent = formatMoney(perPersonBututs);

    // Remainder line (Diff 3): shown only on an uneven split, naming who
    // pays the extra and how much.
    if (valid && remainderBututs > 0) {
      remainder.textContent =
        'One person pays ' +
        remainderBututs +
        (remainderBututs === 1 ? ' butut' : ' bututs') +
        ' (' +
        formatMoney(remainderBututs) +
        ') extra so the split covers the whole bill.';
      remainder.classList.remove('is-hidden');
    } else {
      remainder.textContent = '';
      remainder.classList.add('is-hidden');
    }

    resetBtn.disabled = isFormAtDefaults();
  }

  // ---- reset (Diff 4) ----
  function resetAll() {
    billInput.value = '';
    tipCustom.value = '';
    peopleInput.value = '';
    clearPresetSelection();
    tipSource = null;
    tipPct = 0;
    peopleField.classList.remove('is-error');
    peopleError.classList.add('is-hidden');
    update();
  }

  // ---- wiring ----
  billInput.addEventListener('input', update);
  peopleInput.addEventListener('input', update);
  tipCustom.addEventListener('input', function () {
    applyCustomTip();
    update();
  });
  tipPresets.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectPreset(btn);
      update();
    });
  });
  resetBtn.addEventListener('click', resetAll);

  update();
})();
