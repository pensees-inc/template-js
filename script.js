jQuery(function($){
// -------------------------------------------------------------------
// Global Variable Setting
// -------------------------------------------------------------------
var animationSpeed = 250;
var spWidth = 751;
var pcWidth = 1326;
var winW = window.innerWidth;
// TODO: SPcheckerやrespoCheckerの返り値をグローバル変数化
// TODO: そもそもBabelを前提としてES2015に書き換えたい
// TODO: もっというとTypeScriptにしたい

// -------------------------------------------------------------------
// Common Utility
// -------------------------------------------------------------------

/**
 * SPビューであればtrue,PCビューであればfalseを返す。
 * HACK: window.matchMediaへの書き換えを検討
 */
function spChecker(){
  var spPhone;
  if(window.innerWidth <= spWidth) {
    spPhone = true;
  } else {
    spPhone = false;
  }
  return spPhone;
}

/**
 * PCビューコンテンツ幅とSPビューの間であればtrue、そうでなければfalseを返す。
 * HACK: window.matchMediaへの書き換えを検討
 */
function respoChecker(){
  var duringRespo;
  if(window.innerWidth >= spWidth && window.innerWidth <= pcWidth) {
    duringRespo = true;
  } else {
    duringRespo = false;
  }
  return duringRespo;
}


// -------------------------------------------------------------------
// Smooth Scroll, Navigation
// -------------------------------------------------------------------

/**
 * スムーススクロールを処理。
 * ・js_noScroll
 * ・el_pageTop
 * ・href="#"
 * は処理しない。
 * FIXME: el_pageTopを汎用クラス名に変更
 */
function smoothScroll(){
  var target;
  $('a[href^=#], area[href^=#]').not('.js_noScroll').each(function(){
    $(this).click(function(event) {
      var $this = $(this);
      var href  = $this.attr("href");
      if($this.hasClass('el_pageTop')){
        // クリックした DOM に el_pageTop が合った場合
        target = $('body');
      }else if(href != "#" || href !== ""){
        //hrefが#で終わるもの以外を対象にする
        target = $(href);
      }
      if (target.length > 0) {
        smoothScrollMove(target);
        event.preventDefault();
      }
    });
  });
}

/**
 * smoothScroll関数の依存
 * @param  {jQuery Object} target
 * FIXME: diffPositionが汎用的でない（ヘッダー固定でない案件はどうする？）
 */
function smoothScrollMove(target){
  var headerHeight = $('.ly_header').height();
  var position = target.offset().top;
  var diffPosition  = position - headerHeight; // ヘッダーが固定なのでヘッダー分差し引く

  $("html, body").animate({
    scrollTop: diffPosition
  }, 550, "swing");
  return target;
}

/**
 * ページ読み込み時のスムーススクロール
 * HACK: クエリかハッシュではなく、どちらかに統一しては
 */
function smoothScrollOnLoad(){
  var query = window.location.search,
      hash = window.location.hash,
      headerHeight = $('.ly_header').height();

  // クエリやハッシュがない場合は発火しない
  if(!(query.length || hash.length)) return;

  // タブコンテンツ等用にハッシュを使用する場合、クエリ「?id=id値」を抽出しスクロールを実現する
  if(query.length){
    var queryArray = query.slice(1).split('&');
    for (var i = 0; i < queryArray.length; i++) {
      if (queryArray[i].match(/id=/)) {
         hash = '#' + (queryArray[i].split('=')[1]);
      }
    }
   }

  // スクロールすべきDOMが存在しない場合は発火しない
  var targetOffset = $(hash).offset();
  if(targetOffset != null) {
    function mover(){
      var position = $(hash).offset().top;
      if(spChecker()){
        var diffPosition = position - headerHeight - 10;//良い感じに調整
      } else {
        var diffPosition = position - headerHeight - 50;
      }

      $("html, body").animate({
        scrollTop: diffPosition
      }, 550, "swing");
    }

    mover();
  }
}

/**
 * ページトップボタンをスクロールに応じて表示（要CSSの記述）
 * HACK: いろいろ
 */
function showPageTop(){
  if(window.pageYOffset >= 500){
    $('.ly_pageTop').fadeIn(animationSpeed);
  }else{
    $('.ly_pageTop').fadeOut(animationSpeed);
  }
  if ($(window).scrollTop() + $(window).height() >= $('.ly_footer').offset().top) {
    $('.ly_pageTop').addClass('is_end');
  } else {
    $('.ly_pageTop').removeClass('is_end');
  }
}




// -------------------------------------------------------------------
// Header Fixing
// -------------------------------------------------------------------

/**
* ヘッダーの高さ分padding-topをbodyに設定する
* HACK: position: stickyが実用化すれば必要なし
*/
function setBodyPaddingTop(){
  var defer = $.Deferred();
  var headerHeight = $('.ly_header').height();
  $('body').css('padding-top', headerHeight);

  return defer.resolve();
}

/**
* Wrapper用DOMの高さに window.innerHeight から element.height() を引いた値を設定する。
* 更に .js_wrapping を付与する。
* @param {string} wapper  : Wrapper用DOM （必須）
* @param {string} element : window.innerHeight から高さを差し引きたい DOM （必須）
*/
function wrapperHeightSet(wapper,element){
  // 引数が undefined なら 発火しない
  if(wapper === void 0 || element === void 0) return;
  var diff = window.innerHeight - $(element).height();
  $(wapper).addClass('js_wrapping').height(diff);
}



/**
* wrapperHeightSet() で設定した高さをPCで初期化する。（SPのみで発火）
* @param {string} target : 高さを初期化したいDOM
*/
function resetWrapperHeight(target){
  if(target === void 0) {
    target = '.js_wrapping';
  }
  var spPhone = spChecker();
  if(spPhone) return;
  $(target).each(function(index, el) {
    $(this).css('height','');
  });
}


// -------------------------------------------------------------------
// Execute jQuery Plugins
// -------------------------------------------------------------------

/**
 * jquery.matchHeightの実行
 * FIXME: timer_matchHeightをローカル変数化する
 * FIXME: timer_matchHeightをローカル変数化する
 * OPTIMIZE: パフォーマンスに影響を及ぼす可能性あり
 */
var timer_matchHeight = false;
function matchHeightSet(){
  $.fn.matchHeight._maintainScroll = true;  // ウィンドウサイズを変更すると勝手にスクロールされてしまうバグ対応
  var itemArry = [
    '.js_matchHeight',
    '.js_matchHeight02',
    '.js_matchHeight03',
    '.js_matchHeight04',
    '.js_matchHeight05',
    '.js_matchHeight06',
    '.js_matchHeight07',
    '.js_matchHeight08',
    '.js_matchHeight09',
    '.js_matchHeight10'
  ];
  $.each(itemArry, function(i,val) {
    $(val).matchHeight();
  });
  // js_matchHeightを多数使用すると高さがズレる要素があるのでアップデートをかける
  $.fn.matchHeight._update();
}

function matchTimer() {
  if(timer_matchHeight !== false){
    clearTimeout(timer_matchHeight);
  }
  timer_matchHeight = setTimeout(function(){
    $.fn.matchHeight._update();
  },10);
}


// -------------------------------------------------------------------
// window events
// -------------------------------------------------------------------
$(function(){
  matchHeightSet();
  smoothScroll();
});

$(window).on('load', function(){

  //実行タイミングを制御し、アンカー遷移先がヘッダーに被るのを防ぐ
  setBodyPaddingTop()
    .then(smoothScrollOnLoad());

  $(window).on('scroll', function(){
    showPageTop();
  });

  $(window).on('resize', $.throttle(100, function () {
    if (winW !== window.innerWidth) {
      winW = window.innerWidth;

      matchTimer();
      setBodyPaddingTop();
      resetWrapperHeight();
    }
  }));

});

});
