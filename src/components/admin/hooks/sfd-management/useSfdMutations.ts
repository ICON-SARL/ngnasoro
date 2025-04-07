
import { 
  useAddSfdMutation, 
  useEditSfdMutation, 
  useSuspendSfdMutation, 
  useReactivateSfdMutation 
} from './mutations';

export function useSfdMutations() {
  const addSfdMutation = useAddSfdMutation();
  const editSfdMutation = useEditSfdMutation();
  const suspendSfdMutation = useSuspendSfdMutation();
  const reactivateSfdMutation = useReactivateSfdMutation();

  return {
    addSfdMutation,
    editSfdMutation,
    suspendSfdMutation,
    reactivateSfdMutation
  };
}
