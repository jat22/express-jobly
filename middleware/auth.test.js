"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureAdmin,
  ensureAuthorized,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");


describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
     //there are multiple ways to pass an authorization token, this is how you pass it in the header.
    //this has been provided to show you another way to pass the token. you are only expected to read this code for this project.
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

describe("ensureAdmin", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals : { user: {username: "test", isAdmin: true} } };
    const next = function (e) {
      expect(e).toBeFalsy();
    };
    ensureAdmin(req, res, next)
  })
  test("unauthorized if no login", function() {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  })
  test("unautohrized if not admin", function() {
    expect.assertions(1);
    const req = {};
    const res = { locals : { user: {username: "test", isAdmin: false} } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAdmin(req, res, next)
  })
})

describe("ensureAuthorized", function() {
  test("works with mataching user", function(){
    expect.assertions(1);
    const req = { params : { username: "test" } };
    const res = { locals : { user: {username: "test", isAdmin: false} } };
    const next = function (e) {
      expect(e).toBeFalsy();
    };
    ensureAuthorized(req, res, next)
  });
  test("works with admin", function(){
    expect.assertions(1);
    const req = { params : { username: "test" } };
    const res = { locals : { user: {username: "admin", isAdmin: true} } };
    const next = function (e) {
      expect(e).toBeFalsy();
    };
    ensureAuthorized(req, res, next)
  });
  test("unauth if no login", function(){
    expect.assertions(1);
    const req = { params : { username: "test" } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAuthorized(req, res, next)
  });
  test("unauth if user does not match", function(){
    expect.assertions(1);
    const req = { params : { username: "test" } };
    const res = { locals : { user: {username: "notAdmin", isAdmin: false} } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAuthorized(req, res, next)
  });
})
