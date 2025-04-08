
import { 
  useAddSfdMutation, 
  useEditSfdMutation, 
  useSuspendSfdMutation, 
  useReactivateSfdMutation,
  useActivateSfdMutation
} from './mutations';

export function useSfdMutations() {
  const addSfdMutation = useAddSfdMutation();
  const editSfdMutation = useEditSfdMutation();
  const suspendSfdMutation = useSuspendSfdMutation();
  const reactivateSfdMutation = useReactivateSfdMutation();
  const activateSfdMutation = useActivateSfdMutation();

  return {
    addSfdMutation,
    editSfdMutation,
    suspendSfdMutation,
    reactivateSfdMutation,
    activateSfdMutation
  };
}
