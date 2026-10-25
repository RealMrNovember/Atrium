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
    yenilikleriGoster(dil)
  }

  // Son üç sürüm, uygulamanın kendi sürüm notlarından (yenilikler.json)
  var notlar = null
  function yenilikleriGoster(dil) {
    var kutu = document.getElementById('yenilikler')
    if (!kutu) return
    if (!notlar) {
      fetch('yenilikler.json', { cache: 'no-cache' }).then(function (y) { return y.json() })
        .then(function (v) { notlar = v; yenilikleriGoster(document.documentElement.lang) })
        .catch(function () { kutu.parentNode.style.display = 'none' })
      return
    }
    var liste = (notlar[dil] || notlar.en || []).slice(0, 3)
    kutu.textContent = ''
    liste.forEach(function (n, i) {
      var kart = document.createElement('article')
      if (i === 0) kart.className = 'son'
      var ust = document.createElement('div')
      var surum = document.createElement('span'); surum.className = 'surum'; surum.textContent = 'v' + n.surum
      var tarih = document.createElement('span'); tarih.className = 'tarih'
      try { tarih.textContent = new Date(n.tarih).toLocaleDateString(dil, { year: 'numeric', month: 'long', day: 'numeric' }) } catch (e) { tarih.textContent = n.tarih }
      ust.appendChild(surum); ust.appendChild(tarih)
      var baslik = document.createElement('h3'); baslik.textContent = n.baslik
      var ul = document.createElement('ul')
      n.maddeler.forEach(function (m) { var li = document.createElement('li'); li.textContent = m; ul.appendChild(li) })
      kart.appendChild(ust); kart.appendChild(baslik); kart.appendChild(ul)
      kutu.appendChild(kart)
    })
  }

  var tarayici = (navigator.language || 'en').slice(0, 2).toLowerCase()
  var ilk = kayitli() || (DILLER.indexOf(tarayici) >= 0 ? tarayici : 'en')
  uygula(ilk)
  secici.addEventListener('change', function () {
    kaydet(secici.value)
    uygula(secici.value)
  })
})()
