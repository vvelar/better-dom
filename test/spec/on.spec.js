describe("on", function() {
    var link, input, obj = {test: function() { }, test2: function() {}};

    beforeEach(function() {
        setFixtures("<a id='test'>test element</a><input id='input'/>");

        link = DOM.find("#test");
        input = DOM.find("#input");
    });

    it("should accept single callback", function() {
        spyOn(obj, "test");

        link.on("click", obj.test).call("click");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should accept optional event filter", function() {
        spyOn(obj, "test");

        DOM.on("click input", obj.test);

        link.call("click");

        expect(obj.test).not.toHaveBeenCalled();

        input.call("click");

        expect(obj.test).toHaveBeenCalled();
    });

    it("should accept array of events", function() {
        spyOn(obj, "test");

        input.on(["focus", "click"], obj.test).call("focus");

        expect(obj.test).toHaveBeenCalled();

        input.call("click");

        expect(obj.test.callCount).toEqual(2);
    });

    it("should accept event object", function() {
        spyOn(obj, "test");
        spyOn(obj, "test2");

        input.on({focus: obj.test, click: obj.test2});

        input.call("focus");

        expect(obj.test).toHaveBeenCalled();

        input.call("click");

        expect(obj.test2).toHaveBeenCalled();
    });

    it("should have target element as 'this' by default", function() {
        spyOn(obj, "test").andCallFake(function() {
            expect(this).toEqual(input);
        });

        input.on("click", obj.test).call("click");
    });

    it("should accept optional 'this' argument", function() {
        spyOn(obj, "test").andCallFake(function() {
            expect(this).toEqual(link);
        });

        input.on("click", obj.test, link).call("click");
    });

    it("should throw error if arguments are invalid", function() {
        expect(function() { input.on(123); }).toThrow();
    });

});