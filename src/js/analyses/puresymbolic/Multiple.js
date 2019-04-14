/*
 * Copyright 2013 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

module.exports = function (sandbox) {
    var stats = require('../../utils/StatCollector');
    var STAT_FLAG = stats.STAT_FLAG;

    var single = {};
    require('./Single2')(single);
    var PredValues = require('./PredValues');
    var BDD = require('./BDD');
    var SymbolicBool = require('./../concolic/SymbolicBool');
    var SymbolicAnyVar = require('./SymbolicAnyVar');
    var getIIDInfo = require('./../../utils/IIDInfo');
    var PREFIX1 = "J$";
    var SPECIAL_PROP2 = "*" + PREFIX1 + "I*";
    var EVAL_ORG = eval;


    var TRACE_CALL = true;
    var TRACE_BRANCH = true;
    var TRACE_WRITE = true;
    var TRACE_RETURNS = true;
    var TRACE_TESTS = true;

    var exceptionVal;
    var returnVal = [];
    var funCallDepth = 0;

    var pc = single.getPC();
    var MAX_CALL_DEPTH = pc.getMAX_CALL_DEPTH();

    function makePredValues(pred, value) {
        if (!(value instanceof PredValues)) {
            if (!(pred instanceof PredValues)) {
                value = new PredValues(pred, value);
            } else {
                var ret = new PredValues(), len = pred.values.length;
                for(var i=0; i<len; i++) {
                    ret.addValue(pred.values[i].pred, value);
                }
                value = ret;
            }
        }
        return value;
    }

    function HOP(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }


    function printLogAtReturns(isBackTrack) {
        if (!isBackTrack) {
            console.log(pad + "Returning current function");
        } else {
            console.log(pad + "Backtracking current function");
        }
        console.log(pad + "  Path constraint in BDD form " + pc.getPC().disjunctAll().toString());
        console.log(pad + "                  in predicate form " + pc.getFormulaFromBDD(pc.getPC().disjunctAll()).toString());
        console.log(pad + "  Aggregate path constraint in BDD form " + pc.getAggregatePC().disjunctAll().toString());
        console.log(pad + "                          in predicate form " + pc.getFormulaFromBDD(pc.getAggregatePC().disjunctAll()).toString());
        var tmpRetVal = pc.getReturnVal();
        console.log(pad + "  Aggregate return value " + tmpRetVal);
        //if (tmpRetVal && tmpRetVal.toString().indexOf('NOT_OBLIVIOUS') != -1)
            //pc.generateInputs(tmpRetVal);
    }



    function makeSymbolic(idx, val) {
        return single.makeSymbolic(idx, val);
    }

    //----------------------------------------------- Symbolic funs ----------------------------------------------------

    function nextIndices(indices, maxIndices) {
        var len = indices.length, i;
        indices[len - 1] = indices[len - 1] + 1;
        for (i = len - 1; i >= 0; --i) {
            if (indices[i] === maxIndices[i]) {
                if (i === 0) {
                    return false;
                } else {
                    indices[i] = 0;
                    indices[i - 1] = indices[i - 1] + 1;
                }
            } else {
                break;
            }
        }
        return true;
    }

    function create_concrete_invoke(f, noConcretizeThis, noConcretizeArgs) {
        return function () {
            var len = arguments.length, ret, pred, newPC, value;
            var indices = [], args = [], maxIndices = [], cArgs = [];
            for (var i = 0; i < len; i++) {
                args[i] = makePredValues(BDD.one, arguments[i]);
                indices[i] = 0;
                maxIndices[i] = args[i].values.length;
            }
            newPC = new PredValues();
            ret = undefined;

            do {
                pred = pc.getPC();
                for (i = 0; i < len; ++i) {
                    pred = pred.and(args[i].values[indices[i]].pred);
                }
                if (!pred.isZero()) {
                    pc.pushFrame(pred);
                    for (i = 0; i < len; ++i) {
                        if (noConcretizeArgs) {
                            cArgs[i] = single.initUndefinedNumber(args[i].values[indices[i]].value);
                        } else {
                            cArgs[i] = pc.concretize(single.initUndefinedNumber(args[i].values[indices[i]].value));
                        }
                    }
                    if (noConcretizeThis) {
                        value = f.apply(single.initUndefinedNumber(getSingle(this)), cArgs);
                    } else {
                        value = f.apply(pc.concretize(single.initUndefinedNumber(getSingle(this))), cArgs);
                    }
                    ret = PredValues.addValue(ret, pc.getPC(), value);
                    newPC = newPC.or(pc.getPC());
                    pc.popFrame();
                }
            } while (nextIndices(indices, maxIndices));

            pc.setPC(newPC);
            return ret;
        }
    }


//    function create_concrete_invoke(f) {
//        return function() {
//            var len = arguments.length;
//            for (var i = 0; i<len; i++) {
//                arguments[i] = pc.concretize(getSingle(arguments[i]));
//            }
//            return f.apply(pc.concretize(getSingle(this)),arguments);
//        }
//    }
//
//    function create_concrete_invoke_cons(f) {
//        return function() {
//            var len = arguments.length;
//            for (var i = 0; i<len; i++) {
//                arguments[i] = pc.concretize(getSingle(arguments[i]));
//            }
//            return f.apply(this, arguments);
//        }
//    }

    function string_fromCharCode() {
        var ints = [];
        var i, len = arguments.length, flag = false;
        ;
        for (i = 0; i < len; i++) {
            if (arguments[i] instanceof SymbolicLinear) {
                flag = true;
            }
            ints[i] = arguments[i];

        }
        if (!flag) {
            return String.fromCharCode.apply(this, arguments);
        }
        var newSym = J$.readInput("", true);
        J$.addAxiom(new FromCharCodePredicate(ints, newSym));
        return newSym;
    }

    function regexp_test(str) {
        // this is a regexp object
        var newSym;

        newSym = J$.readInput("", true);
        J$.addAxiom(J$.B(0, "==", newSym, str));
        return J$.B(0, "regexin", newSym, this);
    }

    function getSingle(f) {
        if (f instanceof PredValues) {
            return f.values[0].value;
        } else {
            return f;
        }
    }

    var sfuns;

    function getSymbolicFunctionToInvoke(f, isConstructor) {
        if (f === Array ||
            f === Error ||
            f === String ||
            f === Number ||
            f === Boolean ||
            f === RegExp) {
            return create_concrete_invoke(f, true);
        } else if (f === RegExp.prototype.test) {
            return regexp_test;
        } else if (f === String.fromCharCode) {
            return create_concrete_invoke(string_fromCharCode, true, true);
        } else if (f === J$.addAxiom ||
            f === J$.readInput) {
            return f;
        } else if (f === Math.abs ||
            f === Object.prototype.hasOwnProperty ||
            f === Math.acos ||
            f === Math.asin ||
            f === Math.atan ||
            f === Math.atan2 ||
            f === Math.ceil ||
            f === Math.cos ||
            f === Math.exp ||
            f === Math.floor ||
            f === Math.log ||
            f === Math.max ||
            f === Math.min ||
            f === Math.pow ||
            f === Math.round ||
            f === Math.sin ||
            f === Math.sqrt ||
            f === Math.tan) {
            return create_concrete_invoke(f);
        } else {
            if (f === Array.prototype.push) {
                return getSingle(sfuns.array_push);
            } else if (f === String.prototype.indexOf) {
                return getSingle(sfuns.string_indexOf);
            } else if (f === String.prototype.charCodeAt) {
                return getSingle(sfuns.string_charCodeAt);
            } else if (f === String.prototype.charAt) {
                return getSingle(sfuns.string_charAt);
            } else if (f === String.prototype.lastIndexOf) {
                return getSingle(sfuns.string_lastIndexOf);
            } else if (f === String.prototype.substring) {
                return getSingle(sfuns.string_substring);
            } else if (f === String.prototype.substr) {
                return getSingle(sfuns.string_substr);
            } else if (f === parseInt) {
                return getSingle(sfuns.builtin_parseInt);
            } else if (f === String.prototype.replace) {
                return create_concrete_invoke(f);
            }
        }
        return null;
    }

    function isNative(f) {
        return f.toString().indexOf('[native code]') > -1 || f.toString().indexOf('[object ') === 0;
    }


    function callAsNativeConstructorWithEval(Constructor, args) {
        var a = [];
        for (var i = 0; i < args.length; i++)
            a[i] = 'args[' + i + ']';
        var eval = EVAL_ORG;
        return eval('new Constructor(' + a.join() + ')');
    }

    function callAsNativeConstructor(Constructor, args) {
        if (args.length === 0) {
            return new Constructor();
        }
        if (args.length === 1) {
            return new Constructor(args[0]);
        }
        if (args.length === 2) {
            return new Constructor(args[0], args[1]);
        }
        if (args.length === 3) {
            return new Constructor(args[0], args[1], args[2]);
        }
        if (args.length === 4) {
            return new Constructor(args[0], args[1], args[2], args[3]);
        }
        if (args.length === 5) {
            return new Constructor(args[0], args[1], args[2], args[3], args[4]);
        }
        return callAsNativeConstructorWithEval(Constructor, args);
    }

    function callAsConstructor(Constructor, args) {
        if (isNative(Constructor)) {
            return callAsNativeConstructor(Constructor, args);
        } else {
            var Temp = function () {
            }, inst, ret;
            Temp.prototype = Constructor.prototype;
            inst = new Temp;
            ret = Constructor.apply(inst, args);
            return Object(ret) === ret ? ret : inst;
        }
    }


    function invokeEval(base, f, args) {
        return f.call(base, J$.instrumentCode(args[0], {wrapProgram:false}).code);
    }


    var pad = "| ";

    function singleInvokeFun(iid, base, f, args, isConstructor) {
        var g, invoke, val;

        if (TRACE_CALL) console.log(pad + "Calling " + f.name + " " + getIIDInfo(iid));

        f = single.initUndefinedFunction(f);

        var f_m = getSymbolicFunctionToInvoke(f, isConstructor);

        invoke = f_m || f === undefined || HOP(f, SPECIAL_PROP2) || typeof f !== "function";
        g = f_m || f;
        pushSwitchKey();
        pad = pad + "| ";
        try {
            if (g === EVAL_ORG) {
                val = invokeEval(base, g, args);
            } else if (invoke) {
                if (isConstructor) {
                    val = callAsConstructor(g, args);
                } else {
                    val = g.apply(base, args);
                }
            } else {
                if (TRACE_CALL) console.log(pad + "skip body");
                val = single.wrapUndefined(undefined, false);
            }
        } finally {
            pad = pad.substring(2);
            popSwitchKey();
        }
        if (TRACE_CALL) console.log(pad + "Returning " + f.name);

        return val;
    }

    //--------------------------- End Symbolic Funs --------------------------------------------------------------------


    function F(iid, f, isConstructor) {
        return function () {
            var base = this;
            if (funCallDepth > MAX_CALL_DEPTH) {
                throw new Error("Pruning function call");
            }
            return invokeFun(iid, base, f, arguments, isConstructor);
        }
    }

    function M(iid, base, offset, isConstructor) {
        return function () {
            var f = G(iid, base, offset);
            if (funCallDepth > MAX_CALL_DEPTH) {
                throw new Error("Pruning function call");
            }
            return invokeFun(iid, base, f, arguments, isConstructor);
        };
    }

    function I(val) {
        return val;
    }

    function T(iid, val, type) {
        return single.T(iid, val, type);
    }

    function H(iid, val) {
        return val;
    }


    function R(iid, name, val, isGlobal) {
        return single.wrapUndefined(val, !isGlobal);
    }

    function W(iid, name, val, lhs) {
        var ret;
        if (pc.isRetracing()) {
            return lhs;
        }
        if (STAT_FLAG) stats.addToCounter("multiex operations");
        ret = update(lhs, val);
        if (TRACE_WRITE) {
            console.log(pad + "Writing " + name + " with " + ret + " at " + getIIDInfo(iid));
        }
        return ret;
    }

    function N(iid, name, val, isArgumentSync, isLocalSync) {
        if (isArgumentSync)
            return single.wrapUndefined(val, false);
        return val;
    }


    function A(iid, base, offset, op) {
        var oprnd1 = G(iid, base, offset);
        return function (oprnd2) {
            var val = B(iid, op, oprnd1, oprnd2);
            return P(iid, base, offset, val);
        };
    }


    function update(oldValue, newValue) {
        var ret;
        oldValue = makePredValues(BDD.one, oldValue);
        newValue = makePredValues(pc.getPC(), newValue);


        var i, len, pred, notPc = new PredValues(pc.getPC().disjunctAll().not(), true);
        len = newValue.values.length;
        for (i = 0; i < len; ++i) {
            pred = pc.getPC().and(newValue.values[i].pred);
            if (!pred.isZero()) {
                if (STAT_FLAG) stats.addToCounter("operations");
                ret = PredValues.addValue(ret, pred, newValue.values[i].value);
            }
        }

        len = oldValue.values.length;
        for (i = 0; i < len; ++i) {
            pred = notPc.and(oldValue.values[i].pred);
            if (!pred.isZero()) {
                ret = PredValues.addValue(ret, pred, oldValue.values[i].value);
            }
        }
        if (STAT_FLAG) stats.addToAccumulator("vs-size", ret.size());
        if (STAT_FLAG) stats.addToAccumulator("paths to value ratio", ret.pathsToValueRatio());
        if (STAT_FLAG) ret.isWithinTheory()?stats.addToCounter("within theory assignments"):stats.addToCounter("outside theory assignments");
        return ret;
    }


    function B(iid, op, left, right) {
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);
        right = makePredValues(BDD.one, right);

        if (STAT_FLAG) stats.addToCounter("multiex operations");
        var i, j, leni = left.values.length, lenj = right.values.length, pred, value, ret, newPC = new PredValues(), lenk, k;
        for (i = 0; i < leni; ++i) {
            for (j = 0; j < lenj; ++j) {
                pred = left.values[i].pred.and(right.values[j].pred);
                pred = pc.getPC().and(pred);

                lenk = pred.values.length;
                if (!pred.isZero()) {
                    pc.pushFrame(pred);
                    for(k=0; k<lenk; k++) {
                        if (op !== undefined) {
                            value = single.B(iid, op, left.values[i].value, right.values[j].value);
                        } else {
                            value = single.G(iid, left.values[i].value, right.values[j].value);
                        }
                    }
                    ret = PredValues.addValue(ret, pc.getPC(), value);
                    newPC = newPC.or(pc.getPC());
                    pc.popFrame();
                }
            }
        }
        pc.setPC(newPC);
        return ret;
    }

    function U(iid, op, left) {
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);

        if (STAT_FLAG) stats.addToCounter("multiex operations");
        var i, leni = left.values.length, pred, value, ret, newPC = new PredValues(), lenk, k;
        for (i = 0; i < leni; ++i) {
            pred = pc.getPC().and(left.values[i].pred);

            lenk = pred.values.length;
            if (!pred.isZero()) {
                pc.pushFrame(pred);
                for(k=0; k<lenk; k++) {
                    value = single.U(iid, op, left.values[i].value);
                }
                ret = PredValues.addValue(ret, pc.getPC(), value);
                newPC = newPC.or(pc.getPC());
                pc.popFrame();
            }
        }
        pc.setPC(newPC);
        return ret;
    }

    function G(iid, base, offset) {
        return B(iid, undefined, base, offset);
    }

    function P(iid, left, right, val) {
        var ret, ret2, value;
        if (pc.isRetracing()) {
            return;
        }
        left = makePredValues(BDD.one, left);
        right = makePredValues(BDD.one, right);

        if (STAT_FLAG) stats.addToCounter("multiex operations");
        var i, j, leni = left.values.length, lenj = right.values.length, pred, newPC = new PredValues();
        for (i = 0; i < leni; ++i) {
            for (j = 0; j < lenj; ++j) {
                pred = left.values[i].pred.and(right.values[j].pred);
                pred = pc.getPC().and(pred);

                if (!pred.isZero()) {
                    var base = left.values[i].value;
                    var offset = right.values[j].value;
                    pc.pushFrame(pred);
                    var oldValue = single.G(iid, base, offset);
                    value = single.P(iid, base, offset, ret = update(oldValue, val));
                    if (TRACE_WRITE) {
                        console.log(pad + "Writing field " + offset + " with " + ret + " at " + getIIDInfo(iid));
                    }
                    ret2 = PredValues.addValue(ret2, pc.getPC(), value);
                    newPC = newPC.or(pc.getPC());
                    pc.popFrame();
                }
            }
        }
        pc.setPC(newPC);
        return ret2;
    }


    function invokeFun(iid, base, f, args, isConstructor) {
        if (pc.isRetracing()) {
            return;
        }
//        base = makePredValues(BDD.one, base);
//        f = makePredValues(BDD.one, f);

        base = makePredValues(BDD.one, base).mergeMax();
        f = makePredValues(BDD.one, f).mergeMax();

        var i, j, leni = base.values.length, lenj = f.values.length, pred, value, ret, tmp, f2, newPC = new PredValues();
        pushSwitchKey();
        try {
            for (i = 0; i < leni; ++i) {
                for (j = 0; j < lenj; ++j) {
                    pred = base.values[i].pred.and(f.values[j].pred);
                    pred = pc.getPC().and(pred);

                    if (!pred.isZero()) {
                        f2 = f.values[j].value;
                        if (f2 === J$.addAxiom) {
                            value = singleInvokeFun(iid, base.values[i].value, f2, args, isConstructor);
                            ret = PredValues.addValue(ret, pred, value);
                            newPC = newPC.or(pc.getPC());
                        } else {
                            pc.pushFrame(pred);
                            value = singleInvokeFun(iid, base.values[i].value, f2, args, isConstructor);
                            ret = PredValues.addValue(ret, pc.getPC(), value);
                            newPC = newPC.or(pc.getPC());
                            pc.popFrame();
                        }
                    }
                }
            }
            pc.setPC(newPC);
        } finally {
            popSwitchKey();
        }
        return ret;
    }

    var scriptCount = 0;

    function Se(iid, val) {
        //pc.pushFrame(pc.getPC());
        if (scriptCount===0) {
            stats.resumeTimer("total");
        }
        scriptCount++;
    }

    function Sr(iid) {
        scriptCount--;
        if (scriptCount === 0) {
//            if (STAT_FLAG) stats.addToCounter("DSE inputs");
            stats.suspendTimer("total");
        }
        pc.backtrack();
//        if (TRACE_TESTS && ret2)
//            console.log(pad + "Generated the input " + JSON.stringify(ret2));
        var isException = (exceptionVal !== undefined);// || !ret2;

        var isBackTrack = pc.resetFrame(undefined, isException);
        if (isBackTrack) {
            if (STAT_FLAG) stats.addToCounter("MULTIEX inputs");
        } else if (scriptCount == 0) {
            if (STAT_FLAG) stats.addToCounter("MULTIEX inputs");
            var len = pc.getPC().size(), i;
            for (i=0; i<len; i++)
                if (STAT_FLAG) stats.addToCounter("DSE inputs");
            //pc.printLiteralToFormulas();
            stats.storeStats();
        }

        if (TRACE_RETURNS)
            printLogAtReturns(isBackTrack);
        if (isException && exceptionVal) {
            if (scriptCount == 0) {
                console.log("Pruning path.  No need to worry.")
                //console.log("FYI: exception.  No need to worry.")
                console.log(exceptionVal.stack);
            }
            exceptionVal = undefined;
        }

        return isBackTrack;
    }


    function Fe(iid, val, dis) {
        returnVal.push(undefined);
        exceptionVal = undefined;
        funCallDepth++;
    }

    function Fr(iid) {
        funCallDepth--;
        var aggrRet = pc.getReturnVal();
        pc.backtrack();
        var isException = (exceptionVal !== undefined);
        if (!isException) {
            var retVal = returnVal.pop();
            retVal = PredValues.addValue(aggrRet, pc.getPC(), retVal);
            returnVal.push(retVal);
        } else {
            returnVal.pop();
            returnVal.push(aggrRet);
        }
        var isBackTrack = pc.resetFrame(retVal, isException);
        if (isBackTrack) {
            if (STAT_FLAG) stats.addToCounter("MULTIEX inputs");
            returnVal.pop();
        }
        if (TRACE_RETURNS)
            printLogAtReturns(isBackTrack);
        // if there was an uncaught exception, do not throw it
        // here, chew it up
        // @todo need to revisit
        if (isException && exceptionVal) {
            console.log("Pruning path.  No need to worry.")
            console.log(exceptionVal.stack);
            exceptionVal = undefined;
        }

        return isBackTrack;
    }

    // Uncaught exception
    function Ex(iid, e) {
        exceptionVal = e;
    }

    function Rt(iid, val) {
        returnVal.pop();
        returnVal.push(val);
        return val;
    }

    function Ra() {
        var ret = returnVal.pop();
        exceptionVal = undefined;

        // special case to handle return of undefined from a constructor
        // if undefined is returned from a constructor, do not wrap the return value
        if (ret instanceof PredValues && ret.compactSize() === 1 &&
            ret.values[0].value === undefined) {
            return undefined;
        }
        return ret;
    }

    var Symbolic = require('./../concolic/Symbolic');
    var SymbolicLinear = require('./../concolic/SymbolicLinear');
    var SymbolicStringExpression = require('./SymbolicStringExpression');
    var SymbolicStringPredicate = require('./SymbolicStringPredicate');
    var ToStringPredicate = require('./ToStringPredicate');
    var FromCharCodePredicate = require('./FromCharCodePredicate');

    function isSymbolic(val) {
        if (val === undefined || val === null) {
            return false;
        }
        return val.type === Symbolic;
    }

    function makePredicate(left_s) {
        var ret = left_s;
        if (!isSymbolic(left_s)) {
            return (!!left_s) ? SymbolicBool.true : SymbolicBool.false;
        } else if (left_s instanceof SymbolicLinear) {
            if (left_s.op === SymbolicLinear.UN) {
                ret = left_s.setop("!=");
            }
            return ret;
        } else if (left_s instanceof SymbolicStringExpression) {
            ret = new SymbolicStringPredicate("!=", left_s, "");
            return ret;
        } else if (left_s instanceof SymbolicStringPredicate ||
            left_s instanceof ToStringPredicate ||
            left_s instanceof FromCharCodePredicate ||
            left_s instanceof SymbolicBool) {
            return ret;
        }
        throw new Error("Unknown symbolic value " + left_s);
    }


    var lastVal;
    var switchLeft;
    var switchKeyStack = [];

    function pushSwitchKey() {
        switchKeyStack.push(switchLeft);
    }

    function popSwitchKey() {
        switchLeft = switchKeyStack.pop();
    }

    function last() {
        return lastVal;
    }

    function C1(iid, left) {
        switchLeft = left;
        return true;
    }

    function C2(iid, left) {
        if (pc.isRetracing()) {
            var ret = pc.branchBoth(iid, null, null);
            switchLeft = ret.lastVal;
            return ret.branch;
        }

        left = B(iid, "===", switchLeft, left);
        if (STAT_FLAG) stats.addToCounter("multiex operations");
        if (STAT_FLAG) stats.addToCounter("operations", pc.getPC().size());
        var ret2 = pc.branchBoth(iid, pc.getPC(), left, switchLeft, makePredicate);
        if (TRACE_BRANCH) {
            console.log(pad + "Branching at " + getIIDInfo(iid) + " with result " + ret2);
            //console.log(pad + "true branch condition in BDD form " + ret.toString());
            //console.log(pad + "                          in predicate form " + pc.getFormulaFromBDD(ret).toString());
        }
        return ret2;
    }

    function C(iid, left) {
        if (pc.isRetracing()) {
            var ret = pc.branchBoth(iid, null, null);
            lastVal = ret.lastVal;
            return ret.branch;
        }

        lastVal = left;
        left = makePredValues(BDD.one, left);
        if (STAT_FLAG) stats.addToCounter("multiex operations");
        if (STAT_FLAG) stats.addToCounter("operations", pc.getPC().size());
        var ret2 = pc.branchBoth(iid, pc.getPC(), left, lastVal, makePredicate);
        if (TRACE_BRANCH) {
            console.log(pad + "Branching at " + getIIDInfo(iid) + " with result " + ret2);
            //console.log(pad + "  true branch condition in BDD form " + ret.toString());
            //console.log(pad + "                          in predicate form " + pc.getFormulaFromBDD(ret).toString());
        }
        return ret2;
    }

    function addAxiom(left) {
        if (pc.isRetracing()) {
            return;
        }

        if (left === "begin" || left === "and" || left === "or" || left === "ignore") {
            pc.addAxiom(left);
            return;
        }

        left = makePredValues(BDD.one, left);
        var i, leni = left.values.length, pred1 = BDD.zero, ret;
        for (i = 0; i < leni; ++i) {
            ret = makePredicate(left.values[i].value);
            ret = pc.getBDDFromFormula(ret);
            pred1 = pred1.or(left.values[i].pred.and(ret));
        }
        pc.addAxiom(pc.getPC().and(pred1), true);
    }


    sandbox.U = U; // Unary operation
    sandbox.B = B; // Binary operation
    sandbox.C = C; // Condition
    sandbox.C1 = C1; // Switch key
    sandbox.C2 = C2; // case label C1 === C2
    sandbox._ = last;  // Last value passed to C

    sandbox.H = H; // hash in for-in
    sandbox.I = I; // Ignore argument
    sandbox.G = G; // getField
    sandbox.P = P; // putField
    sandbox.R = R; // Read
    sandbox.W = W; // Write
    sandbox.N = N; // Init
    sandbox.T = T; // object/function/regexp/array Literal
    sandbox.F = F; // Function call
    sandbox.M = M; // Method call
    sandbox.A = A; // Modify and assign +=, -= ...
    sandbox.Fe = Fe; // Function enter
    sandbox.Fr = Fr; // Function return
    sandbox.Se = Se; // Script enter
    sandbox.Sr = Sr; // Script return
    sandbox.Rt = Rt;
    sandbox.Ra = Ra;
    sandbox.Ex = Ex;


    sandbox.makeSymbolic = makeSymbolic;
    sandbox.addAxiom = addAxiom;

    sandbox.postLoad = function () {
        if (!sfuns) {
            pc.pushFrame(pc.getPC());
            scriptCount++; // avoid generating an input
            sfuns = require('./SymbolicFunctions3_jalangi_')
            scriptCount--;
            pc.popFrame();
        }
    }

};

