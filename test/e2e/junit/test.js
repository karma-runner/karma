describe('plus', function() {
  it('should pass', function() {
    expect(true).toBe(true);
  });

  it('should work', function() {
    console.log("First parameter: 1");
    console.log("Second parameter: 2");
    expect(plus(1, 2)).toBe(3);
  });
});
