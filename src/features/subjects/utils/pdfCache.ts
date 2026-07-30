import * as FileSystem from "expo-file-system/legacy";

const PDF_JS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDF_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export const cachedPdfJsPath = `${FileSystem.documentDirectory}pdf.min.js`;
export const cachedWorkerPath = `${FileSystem.documentDirectory}pdf.worker.min.js`;
export const textbookHtmlPath = `${FileSystem.documentDirectory}textbook_viewer.html`;
export const slidedeckHtmlPath = `${FileSystem.documentDirectory}slidedeck_viewer.html`;

export async function ensurePdfJsCached(onProgress?: (progress: number) => void): Promise<boolean> {
  try {
    const pdfJsInfo = await FileSystem.getInfoAsync(cachedPdfJsPath);
    const workerInfo = await FileSystem.getInfoAsync(cachedWorkerPath);

    if (!pdfJsInfo.exists) {
      onProgress?.(0.1);
      const tempPath = `${FileSystem.cacheDirectory}pdf.min.js.tmp`;
      await FileSystem.downloadAsync(PDF_JS_CDN, tempPath);
      await FileSystem.moveAsync({ from: tempPath, to: cachedPdfJsPath });
    }

    if (!workerInfo.exists) {
      onProgress?.(0.5);
      const tempPath = `${FileSystem.cacheDirectory}pdf.worker.min.js.tmp`;
      await FileSystem.downloadAsync(PDF_WORKER_CDN, tempPath);
      await FileSystem.moveAsync({ from: tempPath, to: cachedWorkerPath });
    }

    onProgress?.(1.0);
    return true;
  } catch (error) {
    return false;
  }
}

export async function writeTextbookHtml() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      background-color: #1a1514;
      color: #fff;
      font-family: -apple-system, sans-serif;
      overflow-x: hidden;
    }
    #viewer-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 0;
    }
    .page-container {
      position: relative;
      margin-bottom: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      background-color: #2a2221;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    canvas {
      display: block;
      max-width: 100%;
      height: auto !important;
    }
    .loading-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #221a19;
      color: #e86a50;
      font-size: 14px;
    }
  </style>
  <script src="./pdf.min.js"></script>
</head>
<body>
  <div id="viewer-container"></div>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';

    let pdfDoc = null;
    const container = document.getElementById('viewer-container');
    const renderedPages = new Set();

    window.loadPdfFromBase64 = function(base64Data) {
      try {
        const binStr = atob(base64Data);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        loadingTask.promise.then(function(pdf) {
          pdfDoc = pdf;
          
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'PDF_LOADED',
            totalPages: pdf.numPages
          }));

          renderAllPlaceholders();
        }).catch(function(err) {
          showError(err.message);
        });
      } catch (err) {
        showError(err.message);
      }
    };

    window.goToPage = function(pageNum) {
      const el = document.getElementById('page-' + pageNum);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    function showError(msg) {
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'ERROR',
        message: msg
      }));
      container.innerHTML = '<div style="padding: 20px; color: #ff6b6b; text-align: center;">Error loading PDF: ' + msg + '</div>';
    }

    function renderAllPlaceholders() {
      container.innerHTML = '';
      
      // Get the first page to determine correct aspect ratio
      pdfDoc.getPage(1).then(function(firstPage) {
        const viewport = firstPage.getViewport({ scale: 1.0 });
        const aspectRatio = viewport.width / viewport.height;
        const screenWidth = window.innerWidth;
        const targetWidth = screenWidth - 20; // 10px margin on left & right
        const targetHeight = targetWidth / aspectRatio;

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          createPagePlaceholder(pageNum, targetWidth, targetHeight);
        }

        setupLazyLoading();
      });
    }

    function createPagePlaceholder(pageNum, width, height) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'page-container';
      pageDiv.id = 'page-' + pageNum;
      pageDiv.style.width = width + 'px';
      pageDiv.style.height = height + 'px';

      const placeholder = document.createElement('div');
      placeholder.className = 'loading-placeholder';
      placeholder.innerText = 'Loading Page ' + pageNum + '...';
      pageDiv.appendChild(placeholder);

      const canvas = document.createElement('canvas');
      canvas.id = 'canvas-' + pageNum;
      canvas.style.display = 'none';
      pageDiv.appendChild(canvas);

      container.appendChild(pageDiv);
    }

    function renderPage(pageNum) {
      if (renderedPages.has(pageNum)) return;
      renderedPages.add(pageNum);

      pdfDoc.getPage(pageNum).then(function(page) {
        const pageDiv = document.getElementById('page-' + pageNum);
        const canvas = document.getElementById('canvas-' + pageNum);
        const placeholder = pageDiv.querySelector('.loading-placeholder');

        const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for clear text rendering
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        page.render(renderContext).promise.then(function() {
          if (placeholder) {
            placeholder.style.display = 'none';
          }
          canvas.style.display = 'block';
        });
      });
    }

    function setupLazyLoading() {
      const observerOptions = {
        root: null,
        rootMargin: '100px 0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.id.split('-')[1]);
            renderPage(pageNum);

            // Notify React Native about currently visible page
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'PAGE_VISIBLE',
              page: pageNum
            }));
          }
        });
      }, observerOptions);

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const target = document.getElementById('page-' + pageNum);
        if (target) observer.observe(target);
      }
    }
  </script>
</body>
</html>`;

  await FileSystem.writeAsStringAsync(textbookHtmlPath, html, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

export async function writeSlidedeckHtml() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 100%;
      height: 100%;
      background-color: #1a1514;
      color: #fff;
      font-family: -apple-system, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      user-select: none;
      -webkit-user-select: none;
    }
    #slide-viewport {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .slide-wrapper {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      opacity: 0;
      pointer-events: none;
    }
    .slide-wrapper.active {
      opacity: 1;
      pointer-events: auto;
    }
    .slide-content {
      background-color: #221a19;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    canvas {
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .loading-indicator {
      position: absolute;
      color: #e86a50;
      font-size: 14px;
      font-weight: bold;
    }
  </style>
  <script src="./pdf.min.js"></script>
</head>
<body>
  <div id="slide-viewport"></div>

  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';

    let pdfDoc = null;
    let currentSlide = 1;
    let scale = 1.0;
    const viewportContainer = document.getElementById('slide-viewport');
    const loadedSlides = new Set();

    window.loadPdfFromBase64 = function(base64Data) {
      try {
        const binStr = atob(base64Data);
        const len = binStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        loadingTask.promise.then(function(pdf) {
          pdfDoc = pdf;
          
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'PDF_LOADED',
            totalPages: pdf.numPages
          }));

          createSlidesLayout();
          showSlide(1);
        }).catch(function(err) {
          showError(err.message);
        });
      } catch (err) {
        showError(err.message);
      }
    };

    function showError(msg) {
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'ERROR',
        message: msg
      }));
      viewportContainer.innerHTML = '<div style="padding: 20px; color: #ff6b6b; text-align: center;">Error: ' + msg + '</div>';
    }

    function createSlidesLayout() {
      viewportContainer.innerHTML = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const slideWrapper = document.createElement('div');
        slideWrapper.className = 'slide-wrapper';
        slideWrapper.id = 'slide-wrapper-' + i;

        const slideContent = document.createElement('div');
        slideContent.className = 'slide-content';
        slideContent.id = 'slide-content-' + i;

        const loader = document.createElement('div');
        loader.className = 'loading-indicator';
        loader.innerText = 'Rendering Slide ' + i + '...';
        slideContent.appendChild(loader);

        const canvas = document.createElement('canvas');
        canvas.id = 'canvas-' + i;
        slideContent.appendChild(canvas);

        slideWrapper.appendChild(slideContent);
        viewportContainer.appendChild(slideWrapper);
      }

      setupGestures();
    }

    function renderSlide(slideNum) {
      if (loadedSlides.has(slideNum)) return;
      loadedSlides.add(slideNum);

      pdfDoc.getPage(slideNum).then(function(page) {
        const canvas = document.getElementById('canvas-' + slideNum);
        const slideContent = document.getElementById('slide-content-' + slideNum);
        const loader = slideContent.querySelector('.loading-indicator');

        // Dynamic scale computation to fit completely in viewport
        const viewport = page.getViewport({ scale: 1.0 });
        const viewportW = viewportContainer.clientWidth - 30;
        const viewportH = viewportContainer.clientHeight - 30;
        const scaleW = viewportW / viewport.width;
        const scaleH = viewportH / viewport.height;
        const fitScale = Math.min(scaleW, scaleH) * 1.5; // Render at 1.5x fit for clarity

        const scaledViewport = page.getViewport({ scale: fitScale });
        const context = canvas.getContext('2d');

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        slideContent.style.width = (scaledViewport.width / 1.5) + 'px';
        slideContent.style.height = (scaledViewport.height / 1.5) + 'px';

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        };

        page.render(renderContext).promise.then(function() {
          if (loader) loader.style.display = 'none';
        });
      });
    }

    function showSlide(slideNum) {
      if (slideNum < 1 || slideNum > pdfDoc.numPages) return;

      const oldSlide = currentSlide;
      currentSlide = slideNum;

      // Render target slide and adjacent pre-renders
      renderSlide(currentSlide);
      if (currentSlide < pdfDoc.numPages) renderSlide(currentSlide + 1);
      if (currentSlide > 1) renderSlide(currentSlide - 1);

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const wrapper = document.getElementById('slide-wrapper-' + i);
        if (!wrapper) continue;

        if (i === currentSlide) {
          wrapper.className = 'slide-wrapper active';
          wrapper.style.transform = 'translateX(0)';
          wrapper.style.opacity = '1';
        } else if (i < currentSlide) {
          wrapper.className = 'slide-wrapper';
          wrapper.style.transform = 'translateX(-100%)';
          wrapper.style.opacity = '0';
        } else {
          wrapper.className = 'slide-wrapper';
          wrapper.style.transform = 'translateX(100%)';
          wrapper.style.opacity = '0';
        }
      }

      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'SLIDE_CHANGE',
        current: currentSlide
      }));
    }

    window.nextSlide = function() {
      if (pdfDoc && currentSlide < pdfDoc.numPages) {
        showSlide(currentSlide + 1);
      }
    };

    window.prevSlide = function() {
      if (pdfDoc && currentSlide > 1) {
        showSlide(currentSlide - 1);
      }
    };

    window.setSlide = function(num) {
      if (pdfDoc && num >= 1 && num <= pdfDoc.numPages) {
        showSlide(num);
      }
    };

    // Gestures
    function setupGestures() {
      let startX = 0;
      let startY = 0;
      let isSwipe = false;

      viewportContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          isSwipe = true;
        }
      });

      viewportContainer.addEventListener('touchmove', function(e) {
        if (!isSwipe) return;
        const diffX = e.touches[0].clientX - startX;
        const diffY = e.touches[0].clientY - startY;

        // Determine if horizontal swipe dominates
        if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
          e.preventDefault();
        }
      });

      viewportContainer.addEventListener('touchend', function(e) {
        if (!isSwipe) return;
        isSwipe = false;

        const diffX = e.changedTouches[0].clientX - startX;
        const diffY = e.changedTouches[0].clientY - startY;

        if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) {
            prevSlide();
          } else {
            nextSlide();
          }
        }
      });
    }
  </script>
</body>
</html>`;

  await FileSystem.writeAsStringAsync(slidedeckHtmlPath, html, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}
