using FubuMVC.Core;
using FubuMVC.StructureMap;
using StructureMap;

namespace Fudo.App_Start
{
    public class FuduApplication : IApplicationSource
    {
        public FubuApplication BuildApplication()
        {
            return FubuApplication
                .For<TodoRegistry>()
                .StructureMap<FudoStructureMapRegistry>();
        }
    }
}