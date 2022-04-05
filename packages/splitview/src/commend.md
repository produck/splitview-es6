* Computing view size firstly then updating handlers

* It MUST `reset()` views & handlers after `mount()`, `appendChild`,
  `removechild()`, `insertBefore()`.