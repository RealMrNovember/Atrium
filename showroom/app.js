// Dil seçimi: kayıtlı tercih → tarayıcı dili → İngilizce.
(function () {
  var DILLER = ['en', 'tr', 'de', 'fr', 'it', 'ru']
  var secici = document.getElementById('dil')

  function kayitli() {
    try { return localStorage.getItem('atrium-dil') } catch (e) { return null }
  }
  function kaydet(dil) {
    try { localStorage.setItem('atrium-dil', dil) } catch (e) { /* gizli pencere */ }
  }
  function uygula(dil) {
    var s = window.ATRIUM_I18N[dil] || window.ATRIUM_I18N.en
    document.documentElement.lang = dil
    document.querySelectorAll('[data-t]').forEach(function (el) {
      var anahtar = el.getAttribute('data-t')
      if (s[anahtar]) el.textContent = s[anahtar]
    })
    document.querySelectorAll('[data-t-alt]').forEach(function (el) {
      var anahtar = el.getAttribute('data-t-alt')
      if (s[anahtar]) el.setAttribute('alt', s[anahtar])
    })
    if (s.pageTitle) document.title = s.pageTitle
    secici.value = dil
  }

  var tarayici = (navigator.language || 'en').slice(0, 2).toLowerCase()
  var ilk = kayitli() || (DILLER.indexOf(tarayici) >= 0 ? tarayici : 'en')
  uygula(ilk)
  secici.addEventListener('change', function () {
    kaydet(secici.value)
    uygula(secici.value)
  })
})()
