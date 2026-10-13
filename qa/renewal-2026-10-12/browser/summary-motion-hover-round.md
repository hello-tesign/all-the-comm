# Renewal browser QA

Test server: http://127.0.0.1:4183

Passed 1 / 2; failed 1.

All browser mutations were intercepted. Successful delivery and receipt are outside this UI suite.

- chromium motion pause and resume: Error: Paused canvas kept responding to time/pointer movement
    at ensure (F:\Projects\all the comm\tests\renewal.cjs:24:60)
    at F:\Projects\all the comm\tests\renewal.cjs:299:9
    at async test (F:\Projects\all the comm\tests\renewal.cjs:31:24)
    at async motionTest (F:\Projects\all the comm\tests\renewal.cjs:277:5)
    at async F:\Projects\all the comm\tests\renewal.cjs:324:25
