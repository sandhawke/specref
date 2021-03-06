var assert = require('assert'),
    bibref = require('../lib/bibref');

suite('Test bibref api', function() {
   var obj = {
       FOO: {
           title: "FOO title",
           previousVersions: {
               BAR: { title: "BAR title" },
               BAZ: {}
           }
       },
       foo: { aliasOf: "FOO" },
       hello: { title: "HELLO" }
   };
  test('bibref.raw points to the object passed to the constructor', function() {
      var obj = {};
      assert.strictEqual(obj, bibref.create(obj).raw);
  });
  
  test('bibref.all points to a clone of the object passed to the constructor', function() {
      var obj = {FOO: { title: "foo" }};
      assert.ok(typeof bibref.create(obj).all == "object");
      assert.notStrictEqual(obj, bibref.create(obj).all);
      assert.notStrictEqual(obj.FOO, bibref.create(obj).all.FOO);
      assert.equal(obj.FOO.title, bibref.create(obj).all.FOO.title);
  });
  
  test('bibref.expandRefs expands references correctly', function() {
      
      var expanded = bibref.expandRefs(obj);
      assert.equal("FOO title", expanded.FOO.title);
      assert.equal("BAR title", expanded["FOO-BAR"].title);
      assert.equal("FOO title", expanded["FOO-BAZ"].title);
  });
  
  test('bibref.get returns the proper ref', function() {
      var b = bibref.create(obj);
      assert.equal("object", typeof b.get("FOO"), "Returns an object.");
      assert.ok('FOO' in b.get("FOO"), "Returns an object that contains a FOO prop.");
      assert.equal("object", typeof b.get("FOO").FOO, "Returns an object that has FOO prop which points to an object.");
      assert.equal("FOO title", b.get("FOO").FOO.title, "Returns an object that has FOO prop which points to an object that has the right title.");
  });
  
  test('bibref.get returns an empty object when it can\'t find the ref.', function() {
      var b = bibref.create(obj);
      assert.equal("object", typeof b.get("DOES-NOT-EXIST"), "Returns an object.");
  });
  
  test('if passed an object bibref.get populates and returns it', function() {
      var b = bibref.create(obj);
      var output = {};
      assert.strictEqual(output, b.get("FOO", output), "Returns the object it gets passed as second arg.");
      var output = {};
      b.get("FOO", output)
      assert.equal("FOO title", output.FOO.title);
  });
  
  test('bibref.get treats aliases correctly', function() {
      var b = bibref.create(obj);
      assert.ok('FOO' in b.get("foo"), "Returns the aliased ref.");
      assert.ok('foo' in b.get("foo"), "Returns the ref itself.");
      assert.equal('FOO', b.get("foo").foo.aliasOf, "The ref has an aliasOf property which points to the alias.");
  });
  
  test('bibref.getRefs returns all required references', function() {
      var b = bibref.create(obj);
      var output = b.getRefs(["foo", "hello"]);
      assert.ok('FOO' in output, "Returns the aliased ref.");
      assert.ok('foo' in output, "Returns the ref itself.");
      assert.ok('hello' in output, "Returns another ref.");
  });
});