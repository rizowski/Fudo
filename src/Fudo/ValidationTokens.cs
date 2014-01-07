using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using FubuLocalization;

namespace Fudo
{
    public class ValidationTokens : StringToken
    {
        public static readonly ValidationTokens Name = new ValidationTokens("Name is required.");
        public static readonly ValidationTokens DueDate = new ValidationTokens("Name is required.");

        public ValidationTokens(string value) : base(null, value, namespaceByType:true)
        {
            
        }
    }
}