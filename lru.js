    // ==========================================
// LRU Page Replacement Algorithm Visualization
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  // ==========================================
  // CONFIGURATION AND STATE VARIABLES
  // ==========================================
  
  // Configuration
  let pageReferenceString = [];
  let frameCount = 3;
  
  // Algorithm State
  let currentStep = 0;
  let frames = Array(frameCount).fill(null);
  let lruOrder = [];
  let pageFaults = 0;
  let pageHits = 0;
  let history = [];
  
  // UI State
  let autoPlayInterval = null;
  let animationSpeed = 3;
  
  // ==========================================
  // DOM ELEMENT REFERENCES
  // ==========================================
  
  // Control Buttons
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const resetBtn = document.getElementById('reset-btn');
  const resetAllBtn = document.getElementById('reset-all-btn');
  const autoBtn = document.getElementById('auto-btn');
  
  // Input Elements
  const frameCountInput = document.getElementById('frame-count');
  const pageSequenceInput = document.getElementById('page-sequence-input');
  const speedSliderEl = document.getElementById('speed-slider');
  const speedValueEl = document.getElementById('speed-value');
  const errorIcon = document.querySelector('.error-icon');
  
  // Visualization Elements
  const pageSequenceEl = document.getElementById('page-sequence');
  const framesContainerEl = document.getElementById('frames-container');
  const progressBarEl = document.getElementById('progress-bar');
  
  // Status Elements
  const statusEl = document.getElementById('status');
  const pageFaultsEl = document.getElementById('page-faults');
  const pageHitsEl = document.getElementById('page-hits');
  const hitRatioEl = document.getElementById('hit-ratio');
  const failureRateEl = document.getElementById('failure-rate');
  const currentPageEl = document.getElementById('current-page');
  const lruOrderEl = document.getElementById('lru-order');
  const actionHistoryEl = document.getElementById('action-history');
  const stepCounterEl = document.getElementById('step-counter');
  
  // ==========================================
  // CORE FUNCTIONS
  // ==========================================
  
  // Validate input - only allow letters A-F
  function validateInput(input) {
    const regex = /^[A-Fa-f\s]*$/;
    return regex.test(input);
  }
  
  // Initialize the application state
  function initialize() {
    // Get the input value and parse it
    const inputValue = pageSequenceInput.value.trim();
    
    // Use default sequence if input is empty
    if (inputValue === '') {
      pageReferenceString = [];
      showInputValid();
    } else {
      // Validate the input first
      if (!validateInput(inputValue)) {
        showInputError();
        return;
      }
      
      // Parse the input string into letters
      pageReferenceString = inputValue.split(/\s+/);
      
      showInputValid();
    }
    
    frameCount = parseInt(frameCountInput.value);
    
    // Reset all state variables
    currentStep = 0;
    frames = Array(frameCount).fill(null);
    lruOrder = [];
    pageFaults = 0;
    pageHits = 0;
    history = [{
      frames: [...frames],
      lruOrder: [...lruOrder],
      pageFaults,
      pageHits,
      referencedPage: null,
      isPageFault: false,
      replacedPage: null
    }];
    
    stopAutoPlay();
    renderPageSequence();
    renderFrames();
    updateStatusPanel();
    updateButtons();
    updateActionHistory("Algorithm initialized. Ready to start.");
    updateStepCounter();
    updateProgressBar();
  }
  
  // Show input error
  function showInputError() {
    pageSequenceInput.classList.add('input-error');
    errorIcon.classList.remove('hidden');
  }
  
  // Show input valid
  function showInputValid() {
    pageSequenceInput.classList.remove('input-error');
    errorIcon.classList.add('hidden');
  }
  
  // Reset all function - clears page sequence input as well
  function resetAll() {
    stopAutoPlay();
    pageSequenceInput.value = "";
    showInputValid();
    initialize();
    updateActionHistory("All data has been reset. Enter a new page sequence.");
  }
  
  // Process the next step in the algorithm
  function processNextStep() {
    if (currentStep >= pageReferenceString.length) return;
    
    const page = pageReferenceString[currentStep];
    
    let isPageFault = !frames.includes(page);
    let replacedPage = null;
    
    lruOrder = lruOrder.filter(p => p !== page);
    lruOrder.unshift(page);
    
    if (isPageFault) {
      pageFaults++;
      
      const emptyFrameIndex = frames.indexOf(null);
      if (emptyFrameIndex !== -1) {
        frames[emptyFrameIndex] = page;
      } else {
        const leastRecentlyUsed = lruOrder.pop();
        const replacementIndex = frames.indexOf(leastRecentlyUsed);
        replacedPage = frames[replacementIndex];
        frames[replacementIndex] = page;
        lruOrder.unshift(page);
      }
    } else {
      pageHits++;
    }
    
    currentStep++;
    
    history[currentStep] = {
      frames: [...frames],
      lruOrder: [...lruOrder],
      pageFaults,
      pageHits,
      referencedPage: page,
      isPageFault,
      replacedPage
    };
    
    renderPageSequence();
    renderFrames();
    updateStatusPanel();
    updateActionHistory("");
    updateButtons();
    updateStepCounter();
    updateProgressBar();
    
    // Auto-scroll to the current step in the frames container
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      scrollToCurrentStep();
    }, 50);
  }
  
  // Go back to the previous step
  function goToPreviousStep() {
    if (currentStep <= 0) return;
    
    currentStep--;
    
    const prevState = history[currentStep];
    frames = [...prevState.frames];
    lruOrder = [...prevState.lruOrder];
    pageFaults = prevState.pageFaults;
    pageHits = prevState.pageHits;
    
    renderPageSequence();
    renderFrames();
    updateStatusPanel();
    updateButtons();
    updateStepCounter();
    updateProgressBar();
    
    // Auto-scroll to the current step in the frames container
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      scrollToCurrentStep();
    }, 50);
  }
  
  // Auto-scroll to the current step in the frames container
  function scrollToCurrentStep() {
    if (currentStep > 0) {
      // First, scroll the page sequence to show the current page
      const activePageCell = pageSequenceEl.querySelector('.page-cell.active');
      if (activePageCell) {
        activePageCell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      
      // Then, scroll each frame row to show the current step
      const frameRows = framesContainerEl.querySelectorAll('.frame-row');
      if (frameRows.length > 0) {
        // Find the current step cells in each frame row
        frameRows.forEach(row => {
          const cells = row.querySelectorAll('.page-cell');
          if (cells.length >= currentStep) {
            const currentCell = cells[currentStep - 1];
            if (currentCell) {
              // Mark this cell for scrolling with a data attribute
              currentCell.setAttribute('data-current', 'true');
            }
          }
        });
        
        // Find any cell marked as current
        const currentCell = framesContainerEl.querySelector('[data-current="true"]');
        if (currentCell) {
          // Calculate scroll position to center the current cell
          const container = framesContainerEl;
          const containerRect = container.getBoundingClientRect();
          const cellRect = currentCell.getBoundingClientRect();
          
          // Calculate the scroll position
          const scrollLeft = (cellRect.left + cellRect.width/2) - (containerRect.left + containerRect.width/2) + container.scrollLeft;
          
          // Scroll the container
          container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
          
          // Remove the data attribute after scrolling
          setTimeout(() => {
            currentCell.removeAttribute('data-current');
          }, 100);
        }
      }
    }
  }
  
  // ==========================================
  // RENDERING FUNCTIONS
  // ==========================================
  
  // Render the page reference sequence
  function renderPageSequence() {
    pageSequenceEl.innerHTML = '';
    
    pageReferenceString.forEach((page, index) => {
      const div = document.createElement('div');
      div.className = `page-cell ${index === currentStep - 1 ? 'active' : 'normal'}`;
      div.textContent = page;
      
      if (index === currentStep - 1) {
        const pointer = document.createElement('div');
        pointer.className = 'reference-pointer';
        pointer.innerHTML = '<i class="fas fa-caret-up"></i>';
        div.appendChild(pointer);
      }
      
      pageSequenceEl.appendChild(div);
    });
  }
  
  // Render all frames with their contents
  function renderFrames() {
    framesContainerEl.innerHTML = '';
    
    for (let i = 0; i < frameCount; i++) {
      const frameRow = document.createElement('div');
      frameRow.className = 'frame-row flex items-center mb-4';
      
      const frameLabel = document.createElement('div');
      frameLabel.className = 'frame-label font-medium text-gray-700';
      frameLabel.textContent = `Frame ${i}:`;
      frameRow.appendChild(frameLabel);
      
      const frameContent = document.createElement('div');
      frameContent.className = 'flex space-x-2';
      
      for (let j = 0; j < pageReferenceString.length; j++) {
        const cell = document.createElement('div');
        
        if (j < currentStep) {
          const currentHistory = history[j + 1];
          const frameValue = currentHistory.frames[i];
          
          if (frameValue !== null) {
            cell.textContent = frameValue;
            
            if (j === currentStep - 1) {
              if (currentHistory.replacedPage !== null && currentHistory.frames[i] === currentHistory.referencedPage) {
                cell.className = 'page-cell replaced';
              } else if (currentHistory.isPageFault && currentHistory.frames[i] === currentHistory.referencedPage) {
                cell.className = 'page-cell fault new-page';
              } else if (currentHistory.referencedPage === frameValue) {
                cell.className = 'page-cell hit';
              } else {
                cell.className = 'page-cell normal';
              }
            } else {
              cell.className = 'page-cell normal';
            }
            
            if (j === currentStep - 1 && 
                lruOrder.length === frameCount && 
                lruOrder[lruOrder.length - 1] === frameValue) {
              const indicator = document.createElement('div');
              indicator.className = 'lru-indicator';
              indicator.innerHTML = '<i class="fas fa-clock fa-xs"></i>';
              cell.appendChild(indicator);
            }
          } else {
            cell.textContent = '-';
            cell.className = 'page-cell empty';
          }
        } else {
          cell.textContent = '-';
          cell.className = 'page-cell empty';
        }
        
        frameContent.appendChild(cell);
      }
      
      frameRow.appendChild(frameContent);
      framesContainerEl.appendChild(frameRow);
    }
  }
  
  // ==========================================
  // UI UPDATE FUNCTIONS
  // ==========================================
  
  // Update the status panel
  function updateStatusPanel() {
    if (currentStep === 0) {
      statusEl.textContent = 'Click "Next" to start the algorithm.';
      currentPageEl.textContent = '-';
      lruOrderEl.innerHTML = '-';
      pageHitsEl.textContent = '0';
    } else {
      const currentHistory = history[currentStep];
      
      currentPageEl.textContent = currentHistory.referencedPage;
      pageHitsEl.textContent = currentHistory.pageHits;
      
      if (currentHistory.isPageFault) {
        if (currentHistory.replacedPage !== null) {
          statusEl.innerHTML = `
            <div class="badge badge-red mb-2">Page Fault</div>
            <p>Page ${currentHistory.referencedPage} is not in memory.</p>
            <p>Replacing page ${currentHistory.replacedPage} (LRU) with page ${currentHistory.referencedPage}.</p>
          `;
        } else {
          statusEl.innerHTML = `
            <div class="badge badge-yellow mb-2">Page Fault</div>
            <p>Page ${currentHistory.referencedPage} is not in memory.</p>
            <p>Loading it into an empty frame.</p>
          `;
        }
      } else {
        statusEl.innerHTML = `
          <div class="badge badge-green mb-2">Page Hit</div>
          <p>Page ${currentHistory.referencedPage} is already in memory.</p>
          <p>Updating it as the most recently used page.</p>
        `;
      }
      
      lruOrderEl.innerHTML = '';
      if (currentHistory.lruOrder.length > 0) {
        currentHistory.lruOrder.forEach((page, index) => {
          const pageEl = document.createElement('span');
          if (index === 0) {
            pageEl.className = 'text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md';
            pageEl.title = 'Most Recently Used';
          } else if (index === currentHistory.lruOrder.length - 1 && currentHistory.lruOrder.length === frameCount) {
            pageEl.className = 'text-xs px-2 py-1 bg-red-100 text-red-800 rounded-md';
            pageEl.title = 'Least Recently Used';
          } else {
            pageEl.className = 'text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-md';
          }
          pageEl.textContent = page;
          lruOrderEl.appendChild(pageEl);
        });
      } else {
        lruOrderEl.textContent = '-';
      }
    }
    
    pageFaultsEl.textContent = pageFaults;
    const totalReferences = currentStep;
    const hitRatio = totalReferences > 0 ? Math.round(((totalReferences - pageFaults) / totalReferences) * 100) : 0;
    const failureRate = totalReferences > 0 ? Math.round((pageFaults / totalReferences) * 100) : 0;
    
    hitRatioEl.textContent = `${hitRatio}%`;
    failureRateEl.textContent = `${failureRate}%`;
  }
  
  // Add an entry to the action history
  function updateActionHistory(message) {
    const entry = document.createElement('div');
    
    if (currentStep > 0) {
      const currentHistory = history[currentStep];
      
      if (currentHistory.isPageFault) {
        if (currentHistory.replacedPage !== null) {
          entry.innerHTML = `
            <span class="text-gray-500">[Step ${currentStep}]</span> 
            <span class="badge badge-red">Page Fault</span> 
            Page ${currentHistory.referencedPage} replaced page ${currentHistory.replacedPage} in memory.
          `;
        } else {
          entry.innerHTML = `
            <span class="text-gray-500">[Step ${currentStep}]</span> 
            <span class="badge badge-yellow">Page Fault</span> 
            Page ${currentHistory.referencedPage} loaded into empty frame.
          `;
        }
      } else {
        entry.innerHTML = `
          <span class="text-gray-500">[Step ${currentStep}]</span> 
          <span class="badge badge-green">Page Hit</span> 
          Page ${currentHistory.referencedPage} already in memory.
        `;
      }
    } else {
      entry.innerHTML = `<span class="text-gray-500">[Init]</span> ${message}`;
    }
    
    actionHistoryEl.insertBefore(entry, actionHistoryEl.firstChild);
  }
  
  // Update the step counter
  function updateStepCounter() {
    stepCounterEl.textContent = `Step: ${currentStep} / ${pageReferenceString.length}`;
  }
  
  // Update the progress bar
  function updateProgressBar() {
    const percentage = (currentStep / pageReferenceString.length) * 100;
    progressBarEl.style.width = `${percentage}%`;
  }
  
  // Update button states
  function updateButtons() {
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep >= pageReferenceString.length;
    
    if (currentStep >= pageReferenceString.length || autoPlayInterval) {
      autoBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
      autoBtn.innerHTML = '<i class="fas fa-play"></i> Auto Play';
    }
  }
  
  // ==========================================
  // AUTO PLAY FUNCTIONS
  // ==========================================
  
  // Toggle auto play
  function toggleAutoPlay() {
    if (autoPlayInterval) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }
  
  // Start auto play
  function startAutoPlay() {
    if (currentStep >= pageReferenceString.length) {
      initialize();
    }
    
    const intervals = [2000, 1500, 1000, 700, 400];
    const interval = intervals[animationSpeed - 1];
    
    autoPlayInterval = setInterval(() => {
      processNextStep();
      if (currentStep >= pageReferenceString.length) {
        stopAutoPlay();
      }
    }, interval);
    
    autoBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
  }
  
  // Stop auto play
  function stopAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
      autoBtn.innerHTML = '<i class="fas fa-play"></i> Auto Play';
    }
  }
  
  // Update speed value display
  function updateSpeedDisplay() {
    const speedLabels = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
    speedValueEl.textContent = speedLabels[animationSpeed - 1];
  }
  
  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  
  // Navigation buttons
  prevBtn.addEventListener('click', () => {
    stopAutoPlay();
    goToPreviousStep();
  });
  
  nextBtn.addEventListener('click', () => {
    stopAutoPlay();
    processNextStep();
  });
  
  resetBtn.addEventListener('click', initialize);
  
  resetAllBtn.addEventListener('click', resetAll);
  
  autoBtn.addEventListener('click', toggleAutoPlay);
  
  // Input controls
  speedSliderEl.addEventListener('input', function() {
    animationSpeed = parseInt(this.value);
    updateSpeedDisplay();
    
    if (autoPlayInterval) {
      stopAutoPlay();
      startAutoPlay();
    }
  });
  
  frameCountInput.addEventListener('change', () => {
    stopAutoPlay();
    initialize();
  });
  
  pageSequenceInput.addEventListener('input', function() {
    if (!validateInput(this.value)) {
      showInputError();
      return;
    } else {
      showInputValid();
      if (this.value.trim() !== '') {
        stopAutoPlay();
        initialize();
      }
    }
  });
  
  // ==========================================
  // ANIMATION FUNCTIONS
  // ==========================================
  
  // Add fade-in/slide-up on card load
  document.querySelectorAll('.card').forEach((card, index) => {
    card.classList.add('fade-in');
    card.style.animationDelay = `${index * 0.1}s`;
  });

  // Add animation to control buttons
  document.querySelectorAll('.control-btn').forEach(btn => {
    btn.classList.add('transition-all');
  });

  // Loop Typing Effect for Page Title
  const titleEl = document.querySelector('h1');
  const fullText = 'LRU Page Replacement Algorithm';
  let charIndex = 0;
  let direction = 1; // 1 for typing, -1 for deleting

  function loopTyping() {
    if (direction === 1 && charIndex <= fullText.length) {
      titleEl.textContent = fullText.substring(0, charIndex++);
    } else if (direction === -1 && charIndex >= 0) {
      titleEl.textContent = fullText.substring(0, charIndex--);
    }

    if (charIndex === fullText.length) {
      direction = -1;
      setTimeout(loopTyping, 1500);
      return;
    } else if (charIndex === 0) {
      direction = 1;
      setTimeout(loopTyping, 800);
      return;
    }

    setTimeout(loopTyping, 100);
  }

  if (titleEl) loopTyping();
  
  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  // Initialize the application
  initialize();
  updateSpeedDisplay();
});