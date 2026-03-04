---
sidebar_position: 5
---

# Firmware Developer Setup

Covers bare-metal C/C++, RTOS-based firmware (FreeRTOS, Zephyr, ThreadX), and microcontroller development (STM32, Nordic, ESP32, RP2040, and similar).

> **Important:** AI models know common MCU families, HAL patterns, and RTOS APIs well, but they cannot read your datasheet or know your board's schematic. Always verify register addresses, clock frequencies, pin assignments, and peripheral configuration against your actual hardware documentation. Treat generated peripheral init code as a starting point, not a finished product.

---

## 1. Install an in-editor tool

### Option A: VS Code (recommended)

VS Code with the right extensions is the most common setup for cross-platform embedded development.

**Required extensions:**
- [C/C++ Extension Pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools-extension-pack): IntelliSense, debugging, CMake integration
- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot): inline completions and chat

**Useful optional extensions:**
- [Cortex-Debug](https://marketplace.visualstudio.com/items?itemName=marus25.cortex-debug): GDB/OpenOCD integration for ARM Cortex-M
- [CMake Tools](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cmake-tools): CMake configure/build from the status bar

### Option B: CLion with GitHub Copilot

[CLion](https://www.jetbrains.com/clion/) has excellent CMake support and embedded debugging integration. Install the GitHub Copilot plugin from the JetBrains Marketplace. CLion's code analysis catches more issues than VS Code's IntelliSense for complex C/C++ codebases.

### Option C: STM32CubeIDE / IAR / Keil with Copilot

If you're locked into a vendor IDE, GitHub Copilot has limited direct integration. Use Claude Code in a terminal alongside the vendor IDE; it can read and edit your source files while you build and flash from the vendor tool.

---

## 2. Install Claude Code

Claude Code is especially valuable for embedded work because it can run the review subagents (memory safety, MISRA-C, interrupt safety) across your entire codebase at once, something impractical to do manually.

**Requires Node.js 18+.** On Windows, download from [nodejs.org](https://nodejs.org). On Linux/macOS:

```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt update && sudo apt install nodejs npm
```

Install Claude Code:

```bash
npm install -g @anthropic-ai/claude-code
```

Run from your firmware project root:

```bash
cd firmware
claude
```

See the full [Claude Code guide](../claude-code/overview) for capabilities.

---

## 3. Configure project context (CLAUDE.md)

This is critical for embedded work. Without it, Claude will make assumptions about your MCU family, RTOS, and HAL that may be completely wrong for your hardware.

**Template: STM32 with FreeRTOS (HAL-based):**

```markdown
# Project context

## Hardware
- MCU: STM32H743ZI (Cortex-M7, 480 MHz, 1 MB RAM, 2 MB Flash)
- Board: custom; schematic in /docs/hardware/
- External: QSPI Flash (128 MB), Ethernet PHY (LAN8742A), CAN transceivers (x2)

## Software stack
- STM32CubeHAL (HAL drivers, not LL)
- FreeRTOS 10.4.3 (CMSIS-OS2 API)
- lwIP 2.1.3 for Ethernet
- Compiler: arm-none-eabi-gcc 12.3, C11, C++17

## Conventions
- ISR names follow STM32 HAL convention: HAL_UART_RxCpltCallback, etc.
- All shared variables accessed from both ISR and task context must be declared volatile and protected with taskENTER_CRITICAL() / taskEXIT_CRITICAL()
- No dynamic memory allocation after init (no malloc/free in normal operation)
- Stack sizes defined in FreeRTOSConfig.h - never hardcode them inline

## Commands
- `make` - build (Makefile at root)
- `make flash` - flash via ST-Link using OpenOCD
- `make clean` - clean build artifacts
- `openocd -f interface/stlink.cfg -f target/stm32h7x.cfg` - start debug server

## Do not modify
- Core/Src/stm32h7xx_it.c - ISR table managed by CubeMX
- Core/Inc/FreeRTOSConfig.h - RTOS config, change only after review
- Drivers/ - STM32 HAL driver files, never edit vendor code
```

**Template: Zephyr RTOS:**

```markdown
## Software stack
- Zephyr 3.6, devicetree-based configuration
- nRF52840 (Nordic SDK not used - pure Zephyr)
- BLE via Zephyr BT stack, USB via Zephyr USB subsystem

## Conventions
- All peripherals configured via devicetree overlays in boards/
- Use Zephyr logging (LOG_INF, LOG_ERR) - never printf
- Work queues for deferred processing from ISR context
- K_FOREVER timeouts only in tests - use bounded timeouts in application code

## Commands
- `west build -b nrf52840dk/nrf52840` - build
- `west flash` - flash
- `west build -t menuconfig` - Kconfig menu
```

---

## 4. Add firmware-specific subagents

These subagents from the [firmware & embedded catalog](../claude-code/subagents#firmware--embedded) are the highest-value additions for any firmware project. Drop them in `.claude/agents/`:

| Subagent | What it does |
|----------|-------------|
| [memory-usage-auditor](../claude-code/subagents#memory-usage-auditor) | Audits for stack overflows, heap fragmentation, buffer overflows, and linker map issues |
| [peripheral-config-reviewer](../claude-code/subagents#peripheral-config-reviewer) | Reviews GPIO, UART, SPI, I2C, timers, ADC, and DMA initialization for misconfigurations |
| [interrupt-safety-checker](../claude-code/subagents#interrupt-safety-checker) | Finds race conditions, missing critical sections, and unsafe ISR patterns |
| [misra-c-checker](../claude-code/subagents#misra-c-checker) | Flags MISRA-C:2012 violations; useful for safety-critical and automotive projects |

```bash
mkdir -p .claude/agents
# Save subagent .md files here
```

Invoke them explicitly:

```
Run the interrupt-safety-checker on Core/Src/usart.c and Core/Src/can.c.
Run the memory-usage-auditor on the entire Core/Src/ directory.
```

---

## 5. Daily workflow

### Inline completions in VS Code / CLion

Copilot is most useful for:
- Completing register bit-field definitions you've started typing
- Filling in repetitive HAL init code once you've written the first peripheral
- Suggesting FreeRTOS task boilerplate (task function, stack declaration, `xTaskCreate` call)

Always verify suggestions against your MCU's reference manual for register names and bit positions.

### Claude Code for larger tasks

**Generating boilerplate:**
```
Generate a FreeRTOS task for reading ADC data every 10 ms and pushing samples
into a queue named adcQueue. Use the HAL_ADC_PollForConversion pattern.
Follow the task structure in Core/Src/led_task.c.
```

**Porting code between MCU families:**
```
Port this STM32F4 SPI init code to STM32H7 using HAL. The peripheral registers
moved - update the handle and any HAL version differences. Flag anything
that needs hardware verification.
```

**Writing tests for pure logic:**
```
Write Ceedling/Unity unit tests for the ring buffer implementation in
Core/Src/ring_buffer.c. Test: init, single write/read, overflow behavior,
and wrap-around. No hardware dependencies - the ring buffer is pure C.
```

**Pre-release audit:**
```
Run the memory-usage-auditor, interrupt-safety-checker, and misra-c-checker
on all files in Core/Src/. Generate a combined report.
```

**Debugging ISR issues:**
```
I'm seeing a HardFault when the DMA transfer complete callback fires while
a FreeRTOS task is in the middle of memcpy on the same buffer.
Review Core/Src/dma.c and Core/Src/data_task.c for the race condition.
```

---

## Tips

- **Always specify the exact MCU part number and HAL version in your prompt.** "STM32H743" gives Claude much better register and API accuracy than "STM32".
- **Never trust generated peripheral init code blindly.** Clock enable calls, pin alternate function numbers, and DMA stream/channel assignments are MCU-specific. Cross-check every generated init function with your reference manual.
- **Use AI for logic, not register maps.** AI is excellent at FreeRTOS patterns, C data structures, state machines, and protocol implementations. It is less reliable for exact register bit positions; verify those yourself.
- **Generated MISRA suppressions need justification.** If Claude suggests adding a `/* MISRA C:2012 Rule X.X deviation */` comment, make sure you understand and agree with the deviation reason before accepting it.
- **Linker scripts: explain the memory map first.** Paste your linker script and explain your memory layout before asking about placement directives or section definitions.
- **For Zephyr: paste the relevant devicetree node.** Claude understands Zephyr DTS syntax well, but it needs to see your actual board overlay to give correct advice on devicetree bindings and Kconfig options.
