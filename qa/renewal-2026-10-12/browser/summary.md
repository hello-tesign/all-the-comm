# Renewal browser QA

Test server: http://127.0.0.1:4183

Passed 387 / 388; failed 1.

All browser mutations were intercepted. Successful delivery and receipt are outside this UI suite.

- chromium motion pause and resume: locator.click: Timeout 5000ms exceeded.
Call log:
[2m  - waiting for locator('[data-motion-toggle]').first()[22m
[2m    - locator resolved to <button disabled aria-pressed="false" data-motion-toggle="" class="motion-control">…</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not enabled[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m

    at F:\Projects\all the comm\tests\renewal.cjs:281:28
    at async test (F:\Projects\all the comm\tests\renewal.cjs:30:24)
    at async motionTest (F:\Projects\all the comm\tests\renewal.cjs:276:5)
    at async F:\Projects\all the comm\tests\renewal.cjs:315:34
