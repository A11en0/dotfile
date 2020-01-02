class distillPgBtn extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});

    const style = document.createElement('style');
    const diffBtn = document.createElement('button');
    const ifr = document.createElement('IFRAME');
    const floatId = (Math.random() * 1000) | 0;

    diffBtn.setAttribute('class', 'float'+floatId);
    diffBtn.setAttribute('title', 'Show Changes');
    buttonDocker(this.dataset.pos);

    diffBtn.addEventListener('click', (evt) => {
      const
        scrollStyle = document.body.style.overflow;


      let prevDimensions = {
        height: '100vh',
        width: '100vw',
      };

      ifr.src = this.dataset.src;

      document.body.style.overflow = 'hidden';

      window.addEventListener('message', (event)=>{
        if (event.origin+'/' == this.dataset.base) {
          if (event.data == 'close') {
            try {
              document.body.style.overflow = scrollStyle;
              this.parentNode.removeChild(this);
            } catch (e) {
              console.error('Error removing app: ', e);
            }
          } else if (event.data.name == 'resize') {
            ifr.style.height = event.data.height+'px';
          } else if (event.data.name == 'toggleHeight') {
            const
              temp_dim = {
                height: ifr.style.height,
                width: ifr.style.width,
              };
            ifr.style.height = prevDimensions.height;
            ifr.style.width = prevDimensions.width;
            prevDimensions = temp_dim;
          } else if (event.data.name == 'toggleEmbeddedBtnPos') { // TODO in future get prefs and set position
            buttonDocker(event.data.position);
          }
        }
      });

      ifr.setAttribute('style',
        `position: fixed;
         border: solid 1px #ccc;
         background-color: #fff;
         box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.24);
         z-index: 100000;
         max-height: 100vh;
         max-width: 100vw;
         bottom: 0;
         right: 0;
         height: 42px;
         width: 50vw;
         transition: height 250ms ease`);
      shadow.appendChild(ifr);
    });

    function buttonDocker(pos) {
      if (pos == 'L') {
        diffBtn.style.left = '40px';
        diffBtn.style.right = 'auto';
        ifr.style.right = 'auto';
        ifr.style.left = 0;
      } else {
        diffBtn.style.right = '40px';
        diffBtn.style.left = 'auto';
        ifr.style.left = 'auto';
        ifr.style.right = 0;
      }
    }

    const diffIcon = document.createElement('span');
    style.textContent = `
    .float${floatId}{
      position:fixed;
      display: block;
      width:60px;
      height:60px;
      bottom:40px;
      right:40px;
      background: white;
      content: '';
      border-radius: 50%;
      border: none;
      outline: none;
      background-repeat: no-repeat;
      background-size: contain;
      background-image: url('${this.dataset.base}ui/img/distill.svg');
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.24);
    }
    .float${floatId}:hover:not(:active) {
      bottom: 42px;
      background-image: url('${this.dataset.base}ui/img/distill.svg');
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.24);
    }`;

    shadow.appendChild(style);
    shadow.appendChild(diffBtn);
    diffBtn.appendChild(diffIcon);
  }
}

// Define the new element
customElements.define('distill-page-btn', distillPgBtn);
