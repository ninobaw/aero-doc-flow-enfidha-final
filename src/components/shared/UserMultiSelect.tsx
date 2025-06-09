import * as React from 'react'; // Changed from import React
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';
import { Badge } from '@/components/ui/badge';

interface UserMultiSelectProps {
  selectedUserIds: string[];
  onUserIdsChange: (userIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const UserMultiSelect: React.FC<UserMultiSelectProps> = ({
  selectedUserIds,
  onUserIdsChange,
  placeholder = "Sélectionner des utilisateurs...",
  disabled = false,
}) => {
  const { users, isLoading: isLoadingUsers } = useUsers();
  const [open, setOpen] = useState(false);

  console.log('UserMultiSelect: users', users, 'isLoadingUsers', isLoadingUsers);

  const toggleUser = (userId: string) => {
    const newSelectedUserIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    onUserIdsChange(newSelectedUserIds);
  };

  const getSelectedUserNames = () => {
    if (selectedUserIds.length === 0) {
      return placeholder;
    }
    const names = selectedUserIds
      .map((id) => users.find((user) => user.id === id))
      .filter(Boolean)
      .map((user) => `${user?.firstName} ${user?.lastName}`);
    
    return (
      <div className="flex flex-wrap gap-1">
        {names.map((name, index) => (
          <Badge key={index} variant="secondary" className="flex items-center">
            {name}
            <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              toggleUser(selectedUserIds[index]); // Remove by index, assuming order is preserved
            }} />
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] flex-wrap"
          disabled={disabled || isLoadingUsers}
        >
          {getSelectedUserNames()}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Rechercher un utilisateur..." />
          <CommandList>
            {isLoadingUsers ? (
              <CommandEmpty>Chargement des utilisateurs...</CommandEmpty>
            ) : users.length === 0 ? (
              <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
            ) : (
              <CommandGroup>
                {users.filter(user => user.isActive).map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.firstName} ${user.lastName} ${user.email}`}
                    onSelect={() => toggleUser(user.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUserIds.includes(user.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {user.firstName} {user.lastName} ({user.email})
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};