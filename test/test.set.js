
suite('Set', function() {

  test("Should run reads before writes", function(done) {
    var fastdom = new FastDom();

    var read = sinon.spy(function() {
      assert(!write.called);
    });

    var write = sinon.spy(function() {
      assert(read.called);
      done();
    });

    fastdom.read(read);
    fastdom.write(write);
  });

  test("Should call all reads together, followed by all writes", function(done) {
    var fastdom = new FastDom();
    var read1 = sinon.spy();
    var read2 = sinon.spy();
    var write1 = sinon.spy();
    var write2 = sinon.spy();

    // Assign unsorted
    fastdom.read(read1);
    fastdom.write(write1);
    fastdom.read(read2);
    fastdom.write(write2);

    // After the queue has been emptied
    // check the callbacks were called
    // in the correct order.
    raf(function() {
      assert(read1.calledBefore(read2));
      assert(read2.calledBefore(write1));
      assert(write1.calledBefore(write2));
      done();
    });
  });

  test("Should call a read in the same frame if scheduled inside a read callback", function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();

    fastdom.read(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      fastdom.read(function() {
        assert(!cb.called);
        done();
      });
    });
  });

  test("Should call a write in the same frame if scheduled inside a read callback", function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();

    fastdom.read(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a read callback
      // that should be run in the
      // current frame checking that
      // the RAF callback has not
      // yet been fired.
      fastdom.write(function() {
        assert(!cb.called);
        done();
      });
    });
  });

  test("Should call a read in the *next* frame if scheduled inside a write callback", function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();

    fastdom.write(function() {

      // Schedule a callback for *next* frame
      raf(cb);

      // Schedule a write that should be
      // called in the next frame, meaning
      // the test callback should have already
      // been called.
      fastdom.read(function() {
        assert(cb.called);
        done();
      });
    });
  });

  test("Should call a 'read' callback with the given context", function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    fastdom.read(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test("Should call a 'write' callback with the given context", function(done) {
    var fastdom = new FastDom();
    var cb = sinon.spy();
    var ctx = { foo: 'bar' };

    fastdom.write(function() {
      assert.equal(this.foo, 'bar');
      done();
    }, ctx);
  });

  test("Should have empty job hash when batch complete", function(done) {
    var fastdom = new FastDom();

    fastdom.read(function(){});
    fastdom.read(function(){});
    fastdom.write(function(){});
    fastdom.write(function(){});

    // Check there are four jobs stored
    assert.equal(objectLength(fastdom.jobs), 4);

    raf(function() {
      assert.equal(objectLength(fastdom.jobs), 0);
      done();
    });
  });
});