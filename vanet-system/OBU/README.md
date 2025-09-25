# OBU Product Package — VANET Accident Detection (Production-ready)

Generated: 2025-09-25T09:00:57.604835Z

This package contains a complete, product-focused On-Board Unit (OBU) repository designed to be built, manufactured, and deployed off-the-shelf. It includes:
- Full firmware source (STM32-oriented C with HAL-friendly stubs)
- Build scripts and Makefile adapted for arm-none-eabi toolchain
- Detailed code explanations and developer guides
- Hardware Bill of Materials (BOM) and rationale for component choices (based on user hardware list). See also the uploaded Hardware List for OBU Nodes. fileciteturn3file0
- Text schematics and PCB layout guidance (in text form)
- Power design notes and enclosure guidance
- VANET simulation tools (RSU emulator & OBU simulator)
- Manufacturing and QA checklist
- Licensing (MIT)

Directories:
- firmware/       -> STM32 firmware source, headers, Makefile, docs
- hardware/       -> BOM, schematics (text), connector pinouts, enclosure notes
- simulations/    -> RSU emulator, OBU simulator for VANET testing
- docs/           -> detailed READMEs, flow diagrams, testing plans
- tools/          -> scripts for generating keys, building images, test harness

Read the `docs/GETTING_STARTED.md` for step-by-step build, flash, and test instructions.
