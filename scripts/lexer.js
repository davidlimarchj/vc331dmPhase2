    /* lexer.js  */

	var verb;
	var tokens;
	var foundEOF;
	var errors;
	
	function lex(verbose)
	    {
		//Initialize global vars
		tokens = new Array();
		foundEOF = false;
		errors = new ErrorHandler();
		    
		levelIn++;
		putMessage("Entered Lex");
		 //Activate or deactive verbose mode
		verb = verbose;
		// Grab the "raw" source code.
		var sourceCode = document.getElementById("taSourceCode").value;
		    if(verb)
			putMessage("Retrieved Source Code");
		
		tokens = scannerTokenizer(sourceCode);
		if(verb)
			putMessage("Source Code Tokenized");
		putMessage("Lex Error Count: " + errors.errorCount());
		
		levelIn--;
		errors.print();
        
        var lexReturnText = "Lex returned [";
        
		for(var i=0;i<tokens.length;i++)
		{
			lexReturnText += "[" + tokens[i].type + "]";
		}
		lexReturnText += "]\n";
		putMessage(lexReturnText);    
		
		if(errors.errorCount() > 0)
        anyErrors = true;
		
		return tokens;
	    }

		function scannerTokenizer(str)
		{
			
			levelIn++;
			
			var arr = str.split("");
			var tokenList = new Array();
			var identifierList = new Array();
			var inQoutes = false;
			var line = 0; //Tracks line number
			var column = 0; //Tracks column number
			
			//The Regular Expressions we will be searching for
			var symbolRege = /[\+\-\(\)\{\}\"$=]/;
			var wsRege = /\s/;
			var charRege = /[a-z]/;
			var digitRege = /[0-9]/;
			
			tokenList.push(new T_BOF());
			var i = 0;
			
			while((i<arr.length && !foundEOF))
			{
					//var offset = 0;
					if(arr[i] == "\n")
					    {
						line++;
						column = 0;
					    }
					if(!inQoutes) //Not currently in between qoutation mark
					{
						if (wsRege.test(arr[i])) //Whitespace
						{	
							column++;
						}
						else if(symbolRege.test(arr[i])) //Acceptable Symbols
						{
							if(verb)
								putMessage("Encountered Symbol");
							if(arr[i] == '"') //Open qoute, toggle flag
								inQoutes = true;
                            if(arr[i] == '=' && arr[i+1] == '=') //Comparison, not equals
                            {
                                tokenList.push(new T_eqComp(line, column));
                                i++;
                                column = column +2;
                            }
                            else{
						        tokenList.push(symbolAnalysis(arr[i], line, column));
						        column++;
                            }
						}
						else if(charRege.test(arr[i])) //Identifiers
						{
							if(verb)
								putMessage("Found identifier");
							//find where the next whitespace is to delimite the identifier
							identLen = str.substring(i).search(new RegExp (wsRege.source + "|" + symbolRege.source));
							if(identLen == -1)
							{
								tokenList.push(identifierAnalysis(str.substring(i), line, column)); //End of file
								identLen = str.length - i;
							}
							else
							{
								tokenList.push(identifierAnalysis(str.substring(i, i+identLen), line, column));
							}
							i += identLen-1; //move the scanner index ahead by the length of the identifier
							column = column + identLen;
											
						}
						else if(digitRege.test(arr[i])) //Digits's
						{
							if(verb)
								putMessage("Found digit");
							tokenList.push(new T_digit(arr[i], line, column));
							column++;
							onWhiteSpace = false;
						}
						else
						{
							errors.add(arr[i], "", 0, line, column);
                            tokenList.push(new T_error(arr[i], line, column));
							column++;
                            
						}
				    }
				    else //Current in between qoutation marks
				    {
					if(arr[i] == '"') //Close Qoute
					{
						if(verb)
						putMessage("Found close qoutes");
					    tokenList.push(new T_qoute(line, column));
					    inQoutes = false;
					    column++;
					}
					else if( charRege.test(arr[i])) //Chars
					{
						if(verb)
							putMessage("Found char in qoutes");
						tokenList.push(new T_char(arr[i],line, column));
						column++;
					}
					else if( arr[i] == " ") //Spaces
					{
						if(verb)
							putMessage("Found space in qoutes");
						tokenList.push(new T_space(line, column));
						column++;
					}
					else //Error
					{
						errors.add(arr[i], "", 1, line, column);
						tokenList.push(new T_error(arr[i],line, column));
						column++;
					}
				}
			    
			    i++;
			}
			
			if(!foundEOF)
			{
                errors.add("", "End of File", 50, line, column);
				//putMessage("Warning: Expected a dollar sign at the end of the program. Added for you");
				tokenList.push(new T_EOF(line, column));
			}
			else if(i < arr.length)
			{
                errors.add("", "Nothing", 51, line, column);
				//putMessage("Warning: Found code after the dollar sign. Ignored.");
			}
			
			levelIn--;
			return tokenList;
		}
		

function symbolAnalysis(input, line, column)
    {
	if(input == "=") //Equal operator
            return new T_equal(line, column);
	else if(input == "+") //Plus operator
            return new T_plus(line, column);
        else if(input == "-") //Sub operator
            return new T_sub(line, column);
        else if(input == "(") //Open Parenthesis
            return new T_openParen(line, column);
        else if(input == ")") //Close Parenthesis
            return new T_closeParen(line, column);
        else if(input == "{") //Open Squiggly Brace
            return new T_openSBracket(line, column);
        else if(input == "}") //Close Squiggly Brace
            return new T_closeSBracket(line, column);
	else if(input == "$") //Dollar Sign (End of program symbol)
            return new T_EOF(line, column);
	else if(input == '"') //Qoute
            return new T_qoute(line, column);
        else //Error Case
        {
		errors.add(input, null, 0, line, column);
            return new T_error(input, line, column);
        }
    }
		
		
function identifierAnalysis(str, line, column)
    {

	if(str.length == 1)
		return new T_userId(str, line, column);
	else
	{
		switch (str) {
			case "string":
				return new T_type(str, line, column);
				break;
			case "int":
				return new T_type(str, line, column);
				break;
            case "boolean":
    			return new T_type(str, line, column);
				break;
            case "true":
        		return new T_bool(str, line, column);
				break;
            case "false":
        		return new T_bool(str, line, column);
				break;
			case "print":
				return new T_print(line, column);
				break;
            case "while":
    			return new T_while(line, column);
				break;
            case "if":
    			return new T_if(line, column);
				break;
			default:
				errors.add(str, null, 2, line, column);
				return new T_error(str, line, column);
				break;
		}
	}
   }
   