/* ============================================================
   Mini-project 1: the tip splitter.  THIS IS YOUR FILE.

   Money is tracked in bututs (integers) throughout and only
   formatted to "D0.00" strings on the way out to the DOM. This
   avoids floating-point drift on currency math.
   ============================================================ */

(function () {
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

  // Which control last set the active tip percentage: 'preset',
  // 'custom', or null (nothing selected yet).
  var tipSource = null;
  var tipPct = 0;

  function formatMoney(bututs) {
    var sign = bututs < 0 ? '-' : '';
    var abs = Math.abs(bututs);
    return 'D' + sign + (abs / 100).toFixed(2);
  }

  // A <input type="number"> value is always a string. Treat blank
  // or unparsable as 0/invalid rather than trusting the string.
  function toBututs(value) {
    var n = Number(value);
    if (value === '' || !isFinite(n)) return 0;
    return Math.round(n * 100);
  }

  function toPeopleCount(value) {
    if (value === '') return null;
    var n = Number(value);
    if (!isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
    return n;
  }

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
    var n = Number(tipCustom.value);
    if (tipCustom.value === '' || !isFinite(n)) {
      // Custom field cleared: fall back to no percentage unless a
      // preset is still visually selected (it will not be, since
      // selecting a preset always clears this field, and typing
      // here always clears the presets below).
      tipSource = null;
      tipPct = 0;
      return;
    }
    clearPresetSelection();
    tipSource = 'custom';
    tipPct = n;
  }

  function isFormAtDefaults() {
    return (
      billInput.value === '' &&
      tipCustom.value === '' &&
      peopleInput.value === '' &&
      tipSource === null
    );
  }

  function update() {
    var billBututs = toBututs(billInput.value);
    var people = toPeopleCount(peopleInput.value);
    var valid = people !== null;

    if (valid) {
      peopleField.classList.remove('is-error');
      peopleError.classList.add('is-hidden');
    } else {
      // Only flag as an error once the field has been touched;
      // an untouched blank field should not shout at the user.
      if (peopleInput.value === '') {
        peopleField.classList.remove('is-error');
        peopleError.classList.add('is-hidden');
      } else {
        peopleField.classList.add('is-error');
        peopleError.classList.remove('is-hidden');
      }
    }

    var tipBututs = Math.round((billBututs * tipPct) / 100);
    var totalBututs = billBututs + tipBututs;
    var perPersonBututs = valid ? Math.floor(totalBututs / people) : 0;
    var remainderBututs = valid ? totalBututs - perPersonBututs * people : 0;

    outTip.textContent = formatMoney(tipBututs);
    outTotal.textContent = formatMoney(totalBututs);
    outPerson.textContent = formatMoney(valid ? perPersonBututs : 0);

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
