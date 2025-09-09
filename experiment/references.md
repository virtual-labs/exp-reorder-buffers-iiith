### Books and Textbooks

1. **Hennessy, J. L., & Patterson, D. A.** (2019). _Computer Architecture: A Quantitative Approach_ (6th ed.). Morgan Kaufmann.

   - Chapter 3: Instruction-Level Parallelism and Its Exploitation
   - Section 3.4: Dynamic Scheduling: Examples and the Algorithm
   - Section 3.6: Hardware-Based Speculation

2. **Shen, J. P., & Lipasti, M. H.** (2013). _Modern Processor Design: Fundamentals of Superscalar Processors_. Waveland Press.

   - Chapter 5: Instruction Flow Techniques
   - Chapter 6: Register Data Flow Techniques
   - Chapter 7: Memory Data Flow Techniques

3. **Stallings, W.** (2018). _Computer Organization and Architecture: Designing for Performance_ (11th ed.). Pearson.

   - Chapter 14: Instruction-Level Parallelism and Superscalar Processors
   - Section 14.3: Out-of-Order Execution

4. **Sohi, G. S.** (1990). _Instruction Issue Logic for Pipelined Supercomputers_. IEEE Transactions on Computers, 39(11), 1443-1455.

### Foundational Research Papers

5. **Smith, J. E., & Pleszkun, A. R.** (1988). Implementing precise interrupts in pipelined processors. _IEEE Transactions on Computers_, 37(5), 562-573.

   - Seminal paper on precise interrupt implementation

6. **Hwu, W. M. W., & Patt, Y. N.** (1986). Checkpoint repair for high-performance out-of-order execution machines. _IEEE Transactions on Computers_, C-35(12), 1496-1514.

   - Early work on speculative execution and recovery

7. **Sohi, G. S., & Vajapeyam, S.** (1987). Instruction issue logic for high-performance, interruptible pipelined processors. _Proceedings of the 14th Annual International Symposium on Computer Architecture_, 27-34.

8. **Johnson, M.** (1991). _Superscalar Microprocessor Design_. Prentice Hall.
   - Comprehensive treatment of superscalar design principles

### Advanced Research

9. **Kessler, R. E.** (1999). The Alpha 21264 microprocessor. _IEEE Micro_, 19(2), 24-36.

   - Detailed implementation of ROB in Alpha 21264

10. **Yeager, K. C.** (1996). The MIPS R10000 superscalar microprocessor. _IEEE Micro_, 16(2), 28-40.

    - R10000 implementation with active list (ROB variant)

11. **Papworth, D. B.** (1996). Tuning the Pentium Pro microarchitecture. _IEEE Micro_, 16(2), 8-15.

    - First mainstream x86 processor with ROB

12. **Gwennap, L.** (1995). Digital 21164 sets new standard. _Microprocessor Report_, 9(3), 11-16.
    - Analysis of Alpha 21164 out-of-order execution

### Modern Processor Implementations

13. **Intel Corporation.** (2019). _Intel 64 and IA-32 Architectures Optimization Reference Manual_.

    - Chapter 2: Intel Microarchitecture
    - Section on Out-of-Order Execution Engine

14. **AMD Corporation.** (2020). _Software Optimization Guide for AMD Family 17h Processors_.

    - Chapter 2: Processor Architecture and Optimization
    - Section on Reorder Buffer and Retirement

15. **Boggs, D., Baktha, A., Hawkins, J., Marr, D. T., Miller, J. A., Roussel, P., ... & Nallapati, G.** (2004). The microarchitecture of the Intel Pentium 4 processor on 90nm technology. _Intel Technology Journal_, 8(1), 1-17.

16. **Koomey, J., Berard, S., Sanchez, M., & Wong, H.** (2017). _Implications of historical trends in the electrical efficiency of computing_. IEEE Annals of the History of Computing, 39(3), 46-54.

### Theoretical Analysis

17. **Lam, M. S., & Wilson, R. P.** (1992). Limits of control flow on parallelism. _Proceedings of the 19th Annual International Symposium on Computer Architecture_, 46-57.

18. **Wall, D. W.** (1991). Limits of instruction-level parallelism. _ACM SIGARCH Computer Architecture News_, 19(2), 176-188.

    - Fundamental analysis of ILP limits

19. **Rau, B. R.** (1994). Iterative modulo scheduling: An algorithm for software pipelining loops. _Proceedings of the 27th Annual International Symposium on Microarchitecture_, 63-74.

20. **Fisher, J. A.** (1983). Very long instruction word architectures and the ELI-512. _ACM SIGARCH Computer Architecture News_, 11(3), 140-150.

### Implementation Studies

21. **Palacharla, S., Jouppi, N. P., & Smith, J. E.** (1997). Complexity-effective superscalar processors. _Proceedings of the 24th Annual International Symposium on Computer Architecture_, 206-218.

    - Analysis of complexity vs. performance trade-offs

22. **Farkas, K. I., Chow, P., Jouppi, N. P., & Vranesic, Z.** (1997). The multicluster architecture: Reducing cycle time through partitioning. _Proceedings of the 30th Annual ACM/IEEE International Symposium on Microarchitecture_, 149-159.

23. **Patt, Y. N., Hwu, W. M. W., & Shebanow, M.** (1985). HPS, a new microarchitecture: Rationale and introduction. _Proceedings of the 18th Annual Workshop on Microprogramming_, 103-108.

24. **Butler, M., Barnes, L., Sarkar, D. D., & Sohhi, B.** (1991). Single instruction stream parallelism is greater than two. _ACM SIGARCH Computer Architecture News_, 19(3), 276-286.

### Performance Analysis

25. **Riseman, E. M., & Foster, C. C.** (1972). The inhibition of potential parallelism by conditional jumps. _IEEE Transactions on Computers_, C-21(12), 1405-1411.

26. **Tjaden, G. S., & Flynn, M. J.** (1970). Detection and parallel execution of independent instructions. _IEEE Transactions on Computers_, C-19(10), 889-895.

27. **Thornton, J. E.** (1964). Parallel operation in the control data 6600. _Proceedings of the October 27-29, 1964, Fall Joint Computer Conference, Part II: Very High Speed Computer Systems_, 33-40.

### Modern Research Directions

28. **Sanchez, D., & Kozyrakis, C.** (2013). ZSim: Fast and accurate microarchitectural simulation of thousand-core systems. _ACM SIGARCH Computer Architecture News_, 41(3), 475-486.

29. **Carlson, T. E., Heirman, W., & Eeckhout, L.** (2011). Sniper: Exploring the level of abstraction for scalable and accurate parallel multi-core simulation. _Proceedings of 2011 International Conference for High Performance Computing, Networking, Storage and Analysis_, 1-12.

30. **Miller, J. E., Kasture, H., Kurian, G., Gruenwald, C., Beckmann, N., Celio, C., ... & Agarwal, A.** (2010). Graphite: A distributed parallel simulator for multicores. _IEEE Micro_, 30(1), 44-55.

### Online Resources and Standards

31. **Intel Corporation.** (2021). _Intel Architecture Instruction Set Extensions and Future Features Programming Reference_.

    - Latest developments in x86 microarchitecture

32. **ARM Limited.** (2020). _ARM Cortex-A Series Programmer's Guide for ARMv8-A_.

    - Chapter 4: Out-of-Order Execution in ARM Processors

33. **RISC-V International.** (2019). _The RISC-V Instruction Set Manual, Volume I: Unprivileged ISA_.

    - Considerations for RISC-V implementations with out-of-order execution

34. **IEEE Computer Society.** (2019). _IEEE Standard for Information Technology - Portable Operating System Interface (POSIX)_. IEEE Std 1003.1-2017.

### Survey Papers and Books

35. **Mittal, S.** (2016). A survey of techniques for improving energy efficiency in embedded computing systems. _Renewable and Sustainable Energy Reviews_, 54, 629-660.

36. **Esmaeilzadeh, H., Blem, E., St. Amant, R., Sankaralingam, K., & Burger, D.** (2011). Dark silicon and the end of multicore scaling. _ACM SIGARCH Computer Architecture News_, 39(3), 365-376.

37. **Koomey, J., Berard, S., Sanchez, M., & Wong, H.** (2011). _Implications of historical trends in the electrical efficiency of computing_. IEEE Annals of the History of Computing, 33(3), 46-54.

### Academic Course Materials

38. **University of California, Berkeley.** CS152 Computer Architecture Course Materials.

    - Lecture notes on Out-of-Order Execution and ROB
    - Available at: https://inst.eecs.berkeley.edu/~cs152/

39. **Carnegie Mellon University.** 18-447 Introduction to Computer Architecture.

    - Course materials on dynamic scheduling and speculation
    - Available at: https://www.ece.cmu.edu/~ece447/

40. **MIT OpenCourseWare.** 6.823 Computer System Architecture.
    - Advanced topics in superscalar processor design
    - Available at: https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/

### Technical Reports

41. **Conte, T. M., Banerjia, S., Loh, S. Y., Menezes, K. N., & Sathaye, S. S.** (1995). _Instruction fetch mechanisms for superscalar microprocessors_. Technical Report, Department of Electrical and Computer Engineering, North Carolina State University.

42. **Austin, T. M., Larson, E., & Ernst, D.** (2002). _SimpleScalar: An infrastructure for computer system modeling_. Technical Report, University of Michigan and University of Wisconsin.

43. **Magnusson, P. S., Christensson, M., Eskilson, J., Forsgren, D., Hållberg, G., Högberg, J., ... & Werner, B.** (2002). _Simics: A full system simulation platform_. Computer, 35(2), 50-58.

### Conference Proceedings

44. **International Symposium on Computer Architecture (ISCA)** - Various years

    - Premier venue for computer architecture research including out-of-order execution

45. **International Symposium on Microarchitecture (MICRO)** - Various years

    - Key conference for microarchitectural innovations and ROB research

46. **International Symposium on High-Performance Computer Architecture (HPCA)** - Various years
    - Important venue for performance-oriented architectural research

### Industrial Whitepapers

47. **IBM Corporation.** (1995). _IBM POWER2 Architecture_. IBM Corporation.

    - Early implementation of sophisticated out-of-order execution

48. **Sun Microsystems.** (1995). _UltraSPARC-I User's Manual_. Sun Microsystems, Inc.

    - SPARC implementation with out-of-order execution capabilities

49. **Digital Equipment Corporation.** (1996). _Alpha 21264 Microprocessor Hardware Reference Manual_. Digital Equipment Corporation.
    - Detailed hardware documentation of Alpha 21264 ROB implementation
