document.addEventListener('DOMContentLoaded', () => {
   inpupFile(document.getElementById('exFile'));
   buttonDownUp(document.querySelectorAll('button'));
   linksController(document.querySelectorAll('header a'));

   let parent = document.getElementById('main');
   let header = document.body.querySelector('header');
   let footer = document.body.querySelector('footer');
   let paralaxElem = getParalaxElem(parent);

   let windowHeight = document.documentElement.clientHeight;
   let status = getCoordinatesElement(parent, header.clientHeight, footer.clientHeight);

   window.addEventListener('resize', () => {
      //обновить все параметры, перезапустить fn
      windowHeight = document.documentElement.clientHeight;
      status = getCoordinatesElement(parent, header.clientHeight, footer.clientHeight); //пересчитать статус
      if (status && status.indicateParalax) {
         paralaxWork(paralaxElem, status.subScroll, 0.5, true, status.heightViewport);
      }
   });

   window.addEventListener('scroll', () => {
      status = getCoordinatesElement(parent, header.clientHeight, footer.clientHeight); //пересчитать статус

      if (status && status.indicateParalax) {
         paralaxWork(paralaxElem, status.subScroll, 0.5, true, status.heightViewport);
      }
   });

   let mutationObj = document.getElementById('changing');
   let observer = new MutationObserver(() => {
      windowHeight = document.documentElement.clientHeight;
      status = getCoordinatesElement(parent, header.clientHeight, footer.clientHeight);
      parent = document.getElementById('main');
      paralaxElem = getParalaxElem(parent);
      if (status && status.indicateParalax) {
         // paralaxWork(paralaxElem, status.subScroll, 0.5, true, status.heightViewport);
      }
   });
   observer.observe(mutationObj, {childList: true});
});


function getParalaxElem(elem) {
   let backElem;
   if (!elem) {
      return;
   } else {
      if (getComputedStyle(elem).position === 'static') elem.style.position = 'relative';
      if (elem.querySelector('.paralax')) {
         backElem = elem.querySelector('.paralax');
      } else {
         backElem = document.createElement('div');
         backElem.style.cssText = `width: 100%; height: 100%; position: absolute; top: 0; z-index: -1;`;
         backElem.setAttribute('class', 'paralax');
         copyBackground(elem, backElem);
         elem.style.background = 'none';
         elem.style.overflow = 'hidden';
         elem.append(backElem);
      }
      return backElem;
   }

};

function paralaxWork(paralaxElem, subScroll, speed, ajustHeight = false, heightViewport) {
   if (!paralaxElem) return;
   let heightParent = paralaxElem.parentElement.clientHeight;
   if (ajustHeight && heightViewport) {
      // paralaxElem.style.height = speed <= 1 ? `${heightViewport - (heightViewport - heightParent) * speed}px` : `${heightParent}px`;
      //heightParent + разница остатка пути (heightViewport-heightParent) - часть остатка пути, которую успеет пройти на данной скорости
      paralaxElem.style.height = `${heightViewport - (heightViewport - heightParent) * speed}px`;
   }
   //убрать прокрутку (- subScroll), + сместить на своей скорости (subScroll * speed), задать начальное смещение  + heightParent * (1 - speed)
   paralaxElem.style.transform = `translateY(${subScroll * (speed - 1) + heightParent * (1 - speed)}px)`;
}

function getCoordinatesElement(elem, offsetTop = 0, offsetBottom = 0) {
   if (!elem) return;
   let recElem = elem.getBoundingClientRect();// положение элемента относительно окна
   //верх элемента ниже верхней границы ? сверху скрыто 0 :  скрыто сверху >= , чем высота элемента ? полностью скрыт сверху: скрытая с верху часть элемента
   let topSideHidden = recElem.top >= (0 + offsetTop) ? 0 : ((0 + offsetTop) - recElem.top) >= recElem.height ? 1 : ((0 + offsetTop) - recElem.top) / recElem.height;
   //низ элемента выше нижней границы ? снизу скрыто 0 : снизу скрыто больше или =, чем высота элемента ? элемент скрыт снизу полностью : скрытая внизу часть элемента
   let bottomSideHidden = (recElem.bottom <= (document.documentElement.clientHeight - offsetBottom)) ? 0 : (recElem.bottom - (document.documentElement.clientHeight - offsetBottom)) >= recElem.height ? 1 : (recElem.bottom - (document.documentElement.clientHeight - offsetBottom)) / recElem.height;
   //когда запускать паралакс
   let indicateParalax = topSideHidden < 1 && bottomSideHidden < 1 ? true : false;
   //посчитать прокрутку относительно viewport
   let subScroll = indicateParalax === true ? recElem.top - (0 + offsetTop) + recElem.height : 0;
   let heightViewport = (document.documentElement.clientHeight - offsetBottom) - (0 + offsetTop);
   return {topSideHidden, bottomSideHidden, indicateParalax, subScroll, heightViewport};
}

function copyBackground(donor, recipient) {
   let property = ['backgroundAttachment', 'backgroundBlendMode', 'backgroundClip', 'backgroundColor', 'backgroundImage', 'backgroundOrigin', 'backgroundPositionX', 'backgroundPositionY', 'backgroundRepeat', 'backgroundSize'];
   property.forEach((elem) => {
      if (getComputedStyle(donor)[elem]) recipient.style[elem] = getComputedStyle(donor)[elem];
   })
}

function inpupFile(elem) {
   elem.addEventListener('change', (e) => {
      elem.parentElement.firstChild.data = e.target.value.split('\\').pop();
   });
}

function buttonDownUp(elems) {
   if (!elems) return;
   for (let elem of elems) {
      if (!elem) continue;
      elem.addEventListener('pointerdown', (e) => {
         e.preventDefault();
         elem.classList.toggle('down');
      });
      elem.addEventListener('pointerup', () => elem.classList.toggle('down'));
   }
}
//*************************************************************************************************** */
async function linksController(kit) {
   let click = new Event("click");
   let burg = document.getElementById('burg');
   for (let a of kit) {
      a.addEventListener('click', async (e) => {
         e.preventDefault();
         if (getComputedStyle(burg).display != 'none') burg.dispatchEvent(click);
         // paralax(document.getElementById('main'), 0.5);
         /**
          * determine which page the click is on
          * if the attribute value is an anchor
          *       and we are on the home page, then rewind to find the element whose anchor is at the top with the specified offset
          *       if wea are not on the home page
          *             and there is no element with such an id on the page - message "change the href:value to the link for this element"
          *             if the elemtnt is there but it is hidden - show it and rewind
          * if the attribute value is an link, hide old content by assigning a sign of presence in the DOM
          *       check if it was loaded earlier, if there is a hidden
          *             if there is - display and rewind
          *             if not - start the download, show process, display, rewind
          */

         let href = getHref(a);
         let offset = document.body.querySelector('header').clientHeight;
         let changing = document.getElementById('changing');
         let scroll = window.scrollY;

         if (whatTypeHref(href) == 'ancor') {
            let elem = document.getElementById(href.match(/\w+/));
            if (elem) {
               let position = elem.getBoundingClientRect().top + scroll - offset;
               animate({
                  duration: 1000,
                  draw: function draw(progress) {
                     let pos = position - scroll;
                     window.scrollTo(0, scroll + pos * progress);
                  },
                  timing: function circ(timeFraction) {
                     return 1 - Math.sin(Math.acos(timeFraction));
                  }
               });
            } else {
               if (changing.cash.loaded) {
                  hidden(changing).then(() => {
                     changing.innerHTML = changing.cash.oldContent;
                     changing.removeAttribute('data-status');
                     window.scrollTo(0, getPositionElem(changing, offset));
                  }).then(() => {
                     show(changing).then(() => {
                        buttonDownUp(document.querySelectorAll('button'));
                     });
                  })
               }
            }
         }
         if (whatTypeHref(href) == 'link') {
            if (!changing.cash || !changing.cash.loaded) {
               let ancors = getAncorNewContent(a);
               let content = await getContent(href);
               let fragment = getFragment(content, '<body>', '</body>', false);
               let elems = ancors.map((elem) => {
                  return getElements(fragment, elem);
               });
               let newContent = document.createElement('div');
               elems.forEach(elem => {
                  newContent.append(elem);
               });
               cashContent(changing, changing.innerHTML, newContent.innerHTML);
            }
            if (changing.getAttribute('data-status') == 'loded') {
               let position = changing.getBoundingClientRect().top + scroll - offset;
               animate({
                  duration: 1000,
                  draw: function draw(progress) {
                     let pos = position - scroll;
                     window.scrollTo(0, scroll + pos * progress);
                  },
                  timing: function circ(timeFraction) {
                     return 1 - Math.sin(Math.acos(timeFraction));
                  }
               });
            } else {
               hidden(changing).then(() => {
                  changing.innerHTML = changing.cash.newContent;
                  changing.dataset.status = 'loded';
                  window.scrollTo(0, getPositionElem(changing, offset));
               }).then(() => {
                  show(changing).then(() => {
                     buttonDownUp(document.querySelectorAll('button'));
                  });
               });
            }
         }
      });
   };

   function cashContent(elem, oldContent, newContent) {
      elem.cash = {loaded: true, oldContent: oldContent, newContent: newContent};
   }

   function getHref(a) {
      if (a.tagName == 'A' && a.hasAttribute('href')) {
         return a.getAttribute('href');
      } else {
         console.log('fn-> getHref, element is not teg "a" or heve not attribute "href"')
      }
   }

   function getAncorNewContent(a) {
      if (a.dataset.newcontent) {
         let ancors = a.dataset.newcontent.split(' ');
         return ancors;
      } else {
         console.log(`fn-> getAncorContetn ${a} has not data-newcontent attribute`)
      }
   }

   function whatTypeHref(value) {
      return /^#.*/.test(value) ? 'ancor' : 'link';
   }

   function getContent(url) {
      return fetch(url).then(response => {
         if (response.ok) {
            return response.text();
         } else {
            console.log('request is failed in fn getContent ', response.status);
            return;
         }
      }).then(text => {
         return text;
      }).catch(err => console.log(err));
   }

   //get html fragment from tag to tag (inclusive - default true, without <script> - default true) looking for the first match
   function getFragment(str, from, to, inclusive = true, nosctipt = true) {
      let regexp = new RegExp(`${from}(.*?)${to}`, `s`);
      let without = /<script.*?>.*?<\/script>/gs;
      let fragment = str.match(regexp);
      if (!fragment) {
         console.log('fn-> getFragment, no matches');
         return;
      }
      if (inclusive === true) return nosctipt ? fragment[0].replace(without, '') : fragment[0];
      else return nosctipt ? fragment[1].replace(without, '') : fragment[1];
   }

   function getElements(bunch, selector) {
      let temp = document.createElement('div'); //temporary location to extract items
      temp.innerHTML = bunch;
      let element = temp.querySelector(`${selector}`);
      temp = '';
      return element;
   }

   function getPositionElem(elem, offset) {
      if (elem) {
         return elem.getBoundingClientRect().top + window.scrollY - offset;
      } else {
         return 0;
      }
   }

}

function animate({duration, draw, timing}) {
   let start = performance.now();
   requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;
      let progress = timing(timeFraction);
      draw(progress);
      if (timeFraction < 1) {
         requestAnimationFrame(animate);
      }
   });
}

function animatePromise({duration, draw, timing}) {
   return new Promise((resolve) => {
      let start = performance.now();
      requestAnimationFrame(function animate(time) {
         let timeFraction = (time - start) / duration;
         if (timeFraction > 1) timeFraction = 1;
         let progress = timing(timeFraction);
         draw(progress);
         if (timeFraction < 1) {
            requestAnimationFrame(animate);
         } else {
            resolve();
         }
      });
   })
}

function show(elem) {
   return animatePromise({
      duration: 400,
      draw: function draw(progress) {
         elem.style.opacity = progress;
      },
      timing: function circ(timeFraction) {
         return timeFraction;
      }
   })
}

function hidden(elem) {
   return animatePromise({
      duration: 400,
      draw: function draw(progress) {
         elem.style.opacity = 1 - progress;
      },
      timing: function circ(timeFraction) {
         return timeFraction;
      }
   });
}