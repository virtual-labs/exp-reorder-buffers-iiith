// Reorder Buffer Simulation Engine
class ReorderBufferSimulator {
    constructor() {
        try {
            console.log('[ROB] Starting ReorderBufferSimulator construction...');
            this.reset();
            this.initializeUI();
            console.log('[ROB] ReorderBufferSimulator constructed successfully');
        } catch (error) {
            console.error('[ROB] Error in ReorderBufferSimulator constructor:', error);
            throw error;
        }
    }

    reset() {
        // Processor state
        this.instructionQueue = [];
        this.reorderBuffer = Array(16).fill(null).map((_, i) => ({
            id: i,
            instruction: null,
            state: 'empty',
            destination: null,
            value: null,
            exception: false,
            issued: false
        }));
        this.registerAliasTable = {};
        this.registers = Array(32).fill(0);
        this.memory = Array(1024).fill(0);
        
        // Simulation state
        this.currentCycle = 0;
        this.pc = 0;
        this.headPointer = 0;
        this.tailPointer = 0;
        this.robOccupancy = 0;
        this.isRunning = false;
        this.simulationSpeed = 1000;
        
        // Statistics
        this.stats = {
            instructionsIssued: 0,
            instructionsCompleted: 0,
            instructionsCommitted: 0,
            totalCycles: 0
        };
        
        // Execution timeline
        this.executionTimeline = [];
        this.commitLog = [];
        
        // Sample programs (mirrored in /samples/*.asm for reference)
        // 1: Basic dependency chain
        // 2: Mixed memory + ALU
        // 3: Exception / DIV focus
        // 4: Branch presence (no control-flow change simulated, illustrative only)
        // 5: Independent ILP (low dependencies)
        // 6: Memory traffic focus
        this.samplePrograms = {
            1: `; Basic dependency chain
ADD R1, R2, R3
SUB R4, R1, R5
MUL R6, R4, R7
ADD R8, R6, R9`,
            2: `; Mixed memory + ALU
ADD R1, R2, R3
SUB R4, R1, R5
ADD R6, R7, R8
MUL R9, R4, R6
STORE R9, 100(R0)`,
            3: `; Exception / DIV focus (random DIV exception possible)
ADD R1, R2, R3
DIV R4, R1, R0
SUB R5, R4, R6
ADD R7, R5, R8`,
            4: `; Branch illustration (branches parsed, no PC redirect)
ADD R1, R2, R3
BEQ R1, R2, L1
SUB R4, R1, R5
BNE R4, R5, L2
MUL R6, R4, R7`,
            5: `; Independent ILP (parallel friendly)
ADD R1, R2, R3
ADD R4, R5, R6
MUL R7, R8, R9
ADD R10, R11, R12
SUB R13, R14, R15`,
            6: `; Memory traffic focus
LOAD R1, 0(R2)
LOAD R3, 4(R2)
ADD R4, R1, R3
STORE R4, 8(R2)
MUL R5, R4, R6`
        };
        
        this.updateUI();
    }

    initializeUI() {
        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', (e) => {
                this.simulationSpeed = parseInt(e.target.value);
                speedValue.textContent = this.simulationSpeed;
            });
        } else {
            console.warn('[ROB] Speed slider elements not found during UI initialization');
        }

        // Initialize ROB table
        this.initializeROBTable();
        this.initializeRATTable();
    }

    initializeROBTable() {
        const robTable = document.getElementById('robTable');
        if (!robTable) {
            console.warn('[ROB] robTable element not found during initialization');
            return;
        }
        
        robTable.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>ROB${i}</strong></td>
                <td id="rob-instr-${i}" class="font-mono">-</td>
                <td><span id="rob-state-${i}" class="rob-entry empty">Empty</span></td>
                <td id="rob-dest-${i}" class="font-mono">-</td>
                <td id="rob-value-${i}" class="font-mono">-</td>
                <td id="rob-exception-${i}">-</td>
            `;
            robTable.appendChild(row);
        }
    }

    initializeRATTable() {
        const ratTable = document.getElementById('ratTable');
        if (!ratTable) {
            console.warn('[ROB] ratTable element not found during initialization');
            return;
        }
        
        ratTable.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>R${i}</strong></td>
                <td id="rat-rob-${i}" class="font-mono">-</td>
                <td id="rat-value-${i}" class="font-mono">${this.registers[i]}</td>
            `;
            ratTable.appendChild(row);
        }
    }

    parseInstruction(instrStr) {
        const parts = instrStr.trim().split(/[\s,()]+/).filter(Boolean);
        const opcode = parts[0].toUpperCase();
        
        const instruction = {
            opcode,
            original: instrStr.trim(),
            latency: this.getLatency(opcode),
            executionCyclesLeft: 0,
            issued: false,
            executing: false,
            completed: false
        };

        switch (opcode) {
            case 'ADD':
            case 'SUB':
            case 'MUL':
            case 'DIV':
            case 'AND':
            case 'OR':
                instruction.dest = parts[1];
                instruction.src1 = parts[2];
                instruction.src2 = parts[3];
                break;
            case 'LOAD':
                instruction.dest = parts[1];
                instruction.offset = parseInt(parts[2]) || 0;
                instruction.base = parts[3] || 'R0';
                break;
            case 'STORE':
                instruction.src = parts[1];
                instruction.offset = parseInt(parts[2]) || 0;
                instruction.base = parts[3] || 'R0';
                break;
            case 'BEQ':
            case 'BNE':
                instruction.src1 = parts[1];
                instruction.src2 = parts[2];
                instruction.target = parts[3];
                break;
            default:
                instruction.dest = parts[1];
                instruction.src1 = parts[2];
                instruction.src2 = parts[3];
        }

        return instruction;
    }

    getLatency(opcode) {
        const latencies = {
            'ADD': 1, 'SUB': 1, 'AND': 1, 'OR': 1,
            'MUL': 3, 'DIV': 8,
            'LOAD': 2, 'STORE': 2,
            'BEQ': 1, 'BNE': 1
        };
        return latencies[opcode] || 1;
    }

    loadProgram() {
        const assemblyInput = document.getElementById('assemblyInput');
        const code = assemblyInput.value.trim();
        
        if (!code) {
            alert('Please enter assembly code or load a sample program');
            return;
        }

        this.reset();
        
        // Split + strip comments (lines starting with ;, #, //) and blank lines
        const lines = code.split('\n')
            .map(l => l.trim())
            .filter(l => l && !l.startsWith(';') && !l.startsWith('#') && !l.startsWith('//'));
        this.instructionQueue = lines.map(line => this.parseInstruction(line));
        
        this.updateInstructionQueue();
        this.updateUI();
        
        // Enable simulation controls
        document.getElementById('stepBtn').disabled = false;
        document.getElementById('runBtn').disabled = false;
    }

    loadSample(sampleNum) {
        console.log('[ROB] loadSample called with:', sampleNum);
        const assemblyInput = document.getElementById('assemblyInput');
        console.log('[ROB] assemblyInput element:', assemblyInput);
        
        const program = this.samplePrograms[sampleNum];
        console.log('[ROB] Program text:', program);
        
        if (!program) {
            console.warn('[ROB] No sample program found for id', sampleNum);
            alert('Sample program not found');
            return;
        }
        
        if (!assemblyInput) {
            console.error('[ROB] assemblyInput element not found!');
            alert('Editor element not found');
            return;
        }
        
        assemblyInput.value = program;
        console.log('[ROB] Sample populated in editor. Value set to:', assemblyInput.value);
        // Do NOT auto-parse now; let user click "Load Program" so they can inspect/edit first.
    }

    addInstruction() {
        const operation = document.getElementById('operation').value;
        let instruction = '';
        
        switch (operation) {
            case 'ADD':
            case 'SUB':
            case 'MUL':
            case 'DIV':
                instruction = `${operation} R1, R2, R3`;
                break;
            case 'LOAD':
                instruction = 'LOAD R1, 0(R2)';
                break;
            case 'STORE':
                instruction = 'STORE R1, 0(R2)';
                break;
            case 'BEQ':
            case 'BNE':
                instruction = `${operation} R1, R2, label`;
                break;
        }
        
        const assemblyInput = document.getElementById('assemblyInput');
        if (assemblyInput.value.trim()) {
            assemblyInput.value += '\n' + instruction;
        } else {
            assemblyInput.value = instruction;
        }
    }

    stepExecution() {
        if (this.isRunning) return;
        
        this.executeCycle();
        this.updateUI();
    }

    runSimulation() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.getElementById('runBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stepBtn').disabled = true;
        
        this.runLoop();
    }

    runLoop() {
        if (!this.isRunning) return;
        
        if (this.isSimulationComplete()) {
            this.pauseSimulation();
            alert('Simulation completed!');
            return;
        }
        
        this.executeCycle();
        this.updateUI();
        
        setTimeout(() => this.runLoop(), this.simulationSpeed);
    }

    pauseSimulation() {
        this.isRunning = false;
        document.getElementById('runBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stepBtn').disabled = false;
    }

    executeCycle() {
        this.currentCycle++;
        
        // Commit phase (head of ROB)
        this.commitInstructions();
        
        // Execute phase
        this.executeInstructions();
        
        // Issue phase
        this.issueInstructions();
        
        this.stats.totalCycles = this.currentCycle;
    }

    issueInstructions() {
        // Try to issue up to 2 instructions per cycle
        let issued = 0;
        const maxIssue = 2;
        
        while (issued < maxIssue && this.pc < this.instructionQueue.length) {
            // Check if ROB has space
            if (this.robOccupancy >= 16) break;
            
            const instruction = this.instructionQueue[this.pc];
            if (instruction.issued) {
                this.pc++;
                continue;
            }
            
            // Find free ROB entry
            const robEntry = this.findFreeROBEntry();
            if (!robEntry) break;
            
            // Issue instruction to ROB
            robEntry.instruction = instruction;
            robEntry.state = 'issue';
            robEntry.destination = instruction.dest;
            robEntry.value = null;
            robEntry.exception = false;
            robEntry.issued = true;
            
            instruction.issued = true;
            instruction.robId = robEntry.id;
            instruction.executionCyclesLeft = instruction.latency;
            
            // Update register alias table
            if (instruction.dest && instruction.dest.startsWith('R')) {
                this.registerAliasTable[instruction.dest] = robEntry.id;
            }
            
            this.robOccupancy++;
            this.stats.instructionsIssued++;
            this.pc++;
            issued++;
            
            // Add to execution timeline
            this.addToTimeline(instruction, 'issue');
        }
    }

    executeInstructions() {
        for (let entry of this.reorderBuffer) {
            if (entry.instruction && entry.state === 'issue') {
                // Check if operands are ready
                if (this.areOperandsReady(entry.instruction)) {
                    entry.state = 'execute';
                    entry.instruction.executing = true;
                    this.addToTimeline(entry.instruction, 'execute');
                }
            }
            
            if (entry.instruction && entry.state === 'execute') {
                entry.instruction.executionCyclesLeft--;
                
                if (entry.instruction.executionCyclesLeft <= 0) {
                    // Execution complete
                    entry.state = 'complete';
                    entry.instruction.executing = false;
                    entry.instruction.completed = true;
                    
                    // Calculate result
                    entry.value = this.calculateResult(entry.instruction);
                    
                    // Check for exceptions
                    if (this.checkForException(entry.instruction)) {
                        entry.exception = true;
                        entry.state = 'exception';
                    }
                    
                    this.stats.instructionsCompleted++;
                    this.addToTimeline(entry.instruction, 'complete');
                }
            }
        }
    }

    commitInstructions() {
        // Commit instructions from head of ROB in order
        while (this.robOccupancy > 0) {
            const headEntry = this.reorderBuffer[this.headPointer];
            
            if (!headEntry.instruction || headEntry.state !== 'complete') {
                break; // Can't commit yet
            }
            
            if (headEntry.exception) {
                // Handle exception - flush pipeline
                this.handleException(headEntry);
                break;
            }
            
            // Commit the instruction
            this.commitInstruction(headEntry);
            
            // Clear ROB entry
            headEntry.instruction = null;
            headEntry.state = 'empty';
            headEntry.destination = null;
            headEntry.value = null;
            headEntry.exception = false;
            
            this.headPointer = (this.headPointer + 1) % 16;
            this.robOccupancy--;
            this.stats.instructionsCommitted++;
            
            this.addToTimeline(headEntry.instruction, 'commit');
        }
    }

    commitInstruction(robEntry) {
        const instruction = robEntry.instruction;
        
        // Write result to register file
        if (instruction.dest && instruction.dest.startsWith('R')) {
            const regNum = parseInt(instruction.dest.substring(1));
            this.registers[regNum] = robEntry.value || 0;
            
            // Update RAT if this ROB entry is still the latest
            if (this.registerAliasTable[instruction.dest] === robEntry.id) {
                delete this.registerAliasTable[instruction.dest];
            }
        }
        
        // Add to commit log
        this.commitLog.push({
            cycle: this.currentCycle,
            instruction: instruction.original,
            robId: robEntry.id,
            value: robEntry.value
        });
        
        // Keep only last 20 commits
        if (this.commitLog.length > 20) {
            this.commitLog.shift();
        }
    }

    findFreeROBEntry() {
        if (this.robOccupancy >= 16) return null;
        
        for (let i = 0; i < 16; i++) {
            const index = (this.tailPointer + i) % 16;
            if (this.reorderBuffer[index].state === 'empty') {
                this.tailPointer = (index + 1) % 16;
                return this.reorderBuffer[index];
            }
        }
        return null;
    }

    areOperandsReady(instruction) {
        // Simplified operand readiness check
        return true; // For simulation purposes
    }

    calculateResult(instruction) {
        // Simplified result calculation
        switch (instruction.opcode) {
            case 'ADD': return Math.floor(Math.random() * 100);
            case 'SUB': return Math.floor(Math.random() * 100);
            case 'MUL': return Math.floor(Math.random() * 1000);
            case 'DIV': return Math.floor(Math.random() * 50);
            case 'LOAD': return Math.floor(Math.random() * 100);
            default: return Math.floor(Math.random() * 100);
        }
    }

    checkForException(instruction) {
        // Simulate division by zero exception
        return instruction.opcode === 'DIV' && Math.random() < 0.2;
    }

    handleException(robEntry) {
        alert(`Exception detected in ${robEntry.instruction.original} at ROB entry ${robEntry.id}`);
        
        // Flush all younger instructions
        for (let i = 0; i < 16; i++) {
            const index = (this.headPointer + i) % 16;
            if (index === this.headPointer) continue;
            
            const entry = this.reorderBuffer[index];
            if (entry.instruction) {
                entry.instruction = null;
                entry.state = 'empty';
                entry.destination = null;
                entry.value = null;
                entry.exception = false;
                this.robOccupancy--;
            }
        }
        
        // Reset pipeline state
        this.pc = 0;
        this.registerAliasTable = {};
    }

    simulateException() {
        // Manually trigger an exception for demonstration
        for (let entry of this.reorderBuffer) {
            if (entry.instruction && entry.state === 'execute') {
                entry.exception = true;
                entry.state = 'exception';
                break;
            }
        }
    }

    addToTimeline(instruction, stage) {
        const existing = this.executionTimeline.find(item => 
            item.instruction.original === instruction.original && 
            item.robId === instruction.robId
        );
        
        if (existing) {
            existing.stages[stage] = this.currentCycle;
        } else {
            this.executionTimeline.push({
                instruction,
                robId: instruction.robId,
                stages: { [stage]: this.currentCycle }
            });
        }
    }

    isSimulationComplete() {
        return this.pc >= this.instructionQueue.length && 
               this.robOccupancy === 0;
    }

    resetSimulation() {
        this.pauseSimulation();
        this.reset();
        document.getElementById('assemblyInput').value = '';
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('runBtn').disabled = true;
    }

    updateUI() {
        try {
            this.updateInstructionQueue();
            this.updateROBTable();
            this.updateRATTable();
            this.updateStatistics();
            this.updateTimeline();
            this.updateCommitLog();
        } catch (error) {
            console.warn('[ROB] Error updating UI (elements may not be ready):', error);
        }
    }

    updateInstructionQueue() {
        const queueDiv = document.getElementById('instructionQueue');
        if (!queueDiv) {
            console.warn('[ROB] instructionQueue element not found');
            return;
        }
        
        if (this.instructionQueue.length === 0) {
            queueDiv.innerHTML = '<p class="has-text-grey">No instructions loaded</p>';
            return;
        }
        
        queueDiv.innerHTML = this.instructionQueue.map((instr, index) => {
            let className = 'instruction-item';
            if (index < this.pc && instr.issued) className += ' completed';
            else if (index === this.pc) className += ' current';
            
            return `<div class="${className}">${instr.original}</div>`;
        }).join('');
    }

    updateROBTable() {
        for (let i = 0; i < 16; i++) {
            const entry = this.reorderBuffer[i];
            
            document.getElementById(`rob-instr-${i}`).textContent = 
                entry.instruction ? entry.instruction.original : '-';
            
            const stateSpan = document.getElementById(`rob-state-${i}`);
            stateSpan.textContent = entry.state.charAt(0).toUpperCase() + entry.state.slice(1);
            stateSpan.className = `rob-entry ${entry.state}`;
            
            document.getElementById(`rob-dest-${i}`).textContent = entry.destination || '-';
            document.getElementById(`rob-value-${i}`).textContent = 
                entry.value !== null ? entry.value : '-';
            document.getElementById(`rob-exception-${i}`).textContent = 
                entry.exception ? 'YES' : '-';
        }
    }

    updateRATTable() {
        for (let i = 0; i < 16; i++) {
            const regName = `R${i}`;
            const robId = this.registerAliasTable[regName];
            
            document.getElementById(`rat-rob-${i}`).textContent = 
                robId !== undefined ? `ROB${robId}` : '-';
            document.getElementById(`rat-value-${i}`).textContent = this.registers[i];
            
            const row = document.getElementById(`rat-rob-${i}`).parentElement;
            if (robId !== undefined) {
                row.className = 'rat-entry mapped';
            } else {
                row.className = 'rat-entry';
            }
        }
    }

    updateStatistics() {
        document.getElementById('instructionsIssued').textContent = this.stats.instructionsIssued;
        document.getElementById('instructionsCompleted').textContent = this.stats.instructionsCompleted;
        document.getElementById('instructionsCommitted').textContent = this.stats.instructionsCommitted;
        document.getElementById('currentCycle').value = this.currentCycle;
        document.getElementById('totalCycles').textContent = this.stats.totalCycles;
        
        const utilization = Math.round((this.robOccupancy / 16) * 100);
        document.getElementById('robUtilization').textContent = `${utilization}%`;
        
        const progress = document.getElementById('robProgress');
        progress.value = this.robOccupancy;
        progress.textContent = `${utilization}%`;
        
        const cpi = this.stats.instructionsCommitted > 0 ? 
            (this.currentCycle / this.stats.instructionsCommitted).toFixed(2) : '-';
        document.getElementById('averageCPI').textContent = cpi;
    }

    updateTimeline() {
        const timelineDiv = document.getElementById('executionTimeline');
        
        if (this.executionTimeline.length === 0) {
            timelineDiv.innerHTML = '<p class="has-text-grey">Start simulation to see execution timeline</p>';
            return;
        }
        
        const html = this.executionTimeline.slice(-10).map(item => {
            const stages = ['issue', 'execute', 'complete', 'commit'];
            const stageHtml = stages.map(stage => {
                const cycle = item.stages[stage];
                const className = cycle ? stage : 'empty';
                const text = cycle ? cycle : '';
                return `<div class="timeline-stage ${className}" title="${stage}: ${cycle || 'N/A'}">${text}</div>`;
            }).join('');
            
            return `
                <div class="timeline-row">
                    <div class="timeline-instruction">${item.instruction.original}</div>
                    <div class="timeline-stages">${stageHtml}</div>
                </div>
            `;
        }).join('');
        
        timelineDiv.innerHTML = html;
    }

    updateCommitLog() {
        const logDiv = document.getElementById('commitLog');
        
        if (this.commitLog.length === 0) {
            logDiv.innerHTML = '<p class="has-text-grey">No instructions committed yet</p>';
            return;
        }
        
        const html = this.commitLog.slice(-10).map(entry => 
            `<div class="log-entry">
                <span class="timestamp">Cycle ${entry.cycle}:</span>
                <span class="instruction">${entry.instruction}</span>
                (ROB${entry.robId}, Value: ${entry.value})
            </div>`
        ).join('');
        
        logDiv.innerHTML = html;
    }
}

// Global simulation instance
let simulator;

// Initialize simulation when page loads
function initializeSimulator() {
    console.log('[ROB] Initializing simulator...');
    try {
        simulator = new ReorderBufferSimulator();
        console.log('[ROB] Simulator initialized successfully:', simulator);
    } catch (error) {
        console.error('[ROB] Error initializing simulator:', error);
    }
}

// Multiple initialization attempts to ensure it works
document.addEventListener('DOMContentLoaded', initializeSimulator);
window.addEventListener('load', function() {
    if (!simulator) {
        console.log('[ROB] Retrying simulator initialization on window.load');
        initializeSimulator();
    }
});

// Fallback initialization after a short delay
setTimeout(function() {
    if (!simulator) {
        console.log('[ROB] Fallback simulator initialization');
        initializeSimulator();
    }
}, 100);

// Global functions for HTML event handlers
function loadSample(num) {
    console.log('[ROB] Global loadSample called with:', num, typeof num);
    if (!simulator) {
        console.warn('[ROB] Simulator not initialized, attempting to initialize...');
        initializeSimulator();
        if (!simulator) {
            console.error('[ROB] Failed to initialize simulator!');
            alert('Simulator not ready - please refresh the page');
            return;
        }
    }
    simulator.loadSample(Number(num));
}

// Load currently selected sample from dropdown (if present)
function loadSelectedSample() {
    console.log('[ROB] loadSelectedSample called');
    const sel = document.getElementById('sampleSelector');
    console.log('[ROB] Selector element:', sel);
    if (sel) {
        console.log('[ROB] Selected value:', sel.value);
        loadSample(sel.value);
    } else {
        console.error('[ROB] sampleSelector element not found!');
    }
}

function addInstruction() {
    if (!simulator) initializeSimulator();
    simulator.addInstruction();
}

function loadProgram() {
    if (!simulator) initializeSimulator();
    simulator.loadProgram();
}

function stepExecution() {
    if (!simulator) initializeSimulator();
    simulator.stepExecution();
}

function runSimulation() {
    if (!simulator) initializeSimulator();
    simulator.runSimulation();
}

function pauseSimulation() {
    if (!simulator) initializeSimulator();
    simulator.pauseSimulation();
}

function resetSimulation() {
    if (!simulator) initializeSimulator();
    simulator.resetSimulation();
}

function simulateException() {
    if (!simulator) initializeSimulator();
    simulator.simulateException();
}

function openModal() {
    document.getElementById('helpModal').classList.add('is-active');
}

function closeModal() {
    document.getElementById('helpModal').classList.remove('is-active');
}

// Close modal when clicking background
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-background')) {
        closeModal();
    }
});

// (Removed duplicate DOMContentLoaded handler earlier in file)
