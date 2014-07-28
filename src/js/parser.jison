/* Google-Like Parser */

/* Lexical Grammar */

%lex
%%

\s+							{ /* ignore whitespace */ }
"AND"|"&&"					{ return "AND" }
"OR"|"||"					{ return "OR" }
"NOT"|"!"					{ return "NOT" }
"("							{ return "OPEN" }
")"							{ return "CLOSE" }
":"							{ return "QUAL" }
"-"							{ return "NEG" }
"\""|"'"					{ return "QUOTE" }
\w+((\-|\.|\@)\w+)*			{ return "TERM" }
"."							{ return "DOT" }
<<EOF>>						{ return "EOF" }
.							{ return "INVALID" }

/lex

/* Operators */

%right AND OR
%right NOT
%right QUAL NEG DOT

%start START

%%

/* Language Grammar */

START
	: EXP EOF
		{ return $1; }
	;

EXP
	: EXP AND EXP
		{ $$ = function(record) { return ($1(record) && $3(record)); }; }
	| EXP OR EXP
		{ $$ = function(record) { return ($1(record) || $3(record)); }; }
	| NOT EXP
		{ $$ = function(record) { return !($2(record)); }; }
	| OPEN EXP CLOSE
		{ $$ = $2; }
	| ARGS
		{ $$ = function(record) { return parser.processArgs(record, $1)(record); }; }
	;

ARGS
	: ARG ARGS
		{ $$ = [ $1, $2]; }
	| OP ARGS
		{ $$ = [ $1, $2]; }
	| ARG
		{ $$ = [ $1 ]; }
	| OP
		{ $$ = [ $1 ]; }
	;

OP
	: NEG ARG
		{{
			$2.negate = true;
			$$ = $2;
		}}
	| NEG ARG QUAL ARG
		{{
			$$ = {
				"negate": true,
				"operator": $2.operand,
				"operand": $4.operand
			};
		}}
	| ARG QUAL ARG
		{{
			$$ = {
				"negate": false,
				"operator": $1.operand,
				"operand": $3.operand
			};
		}}
	;

ARG
	: QUOTE TERMS QUOTE
		{{
			$$ = {
				"negate": false,
				"operator": null,
				"operand": $2.join(" ")
			};
		}}
	| TERM
		{{
			$$ = {
				"negate": false,
				"operator": null,
				"operand": $1
			};
		}}
	;

TERMS
	: TERM TERMS
		{ $$ = [ $1 ].concat($2); }
	| TERM
		{ $$ = [ $1 ]; }
	;

%%

parser.processArgs = function(record, args) {
	if (args.length > 1)
	{
		if (args[1][0].operator)
			return function(record) { return (parser.matchArg(record, args[0]) && parser.processArgs(record, args[1])(record)); };
		else
			return function(record) { return (parser.matchArg(record, args[0]) || parser.processArgs(record, args[1])(record)); };
	}
	else
	{
		return function(record) { return parser.matchArg(record, args[0]); };
	}
};

parser.matchArg = function(record, arg) {
	/* Implement Later */
	var match = matchRecord(record, arg.operator, arg.operand);
	if (arg.negate)
		return !match;
	else
		return match;
};
