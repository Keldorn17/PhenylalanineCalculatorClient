export interface NavItem {
  label: string;
  path?: string;
  children?: NavItem[];
}

export const NavPath = {
  home: {
    label: 'nav.home',
    path: '/login'
  },
  foodTypes: {
    label: 'nav.foodTypes',
    list: {
      label: 'nav.viewList',
      path: '/food-types'
    },
    add: {
      label: 'nav.addFoodType',
      path: '/food-types/add'
    }
  }
};

/**
 * Parses the nested object configuration (NavPath) into a list of NavItems.
 * It ignores 'label' and 'path' keys at each level and treats other nested objects as children.
 */
export function parseNavPath(obj: Record<string, unknown>): NavItem[] {
  const items: NavItem[] = [];

  for (const key of Object.keys(obj)) {
    if (key === 'label' || key === 'path') {
      continue;
    }

    const val = obj[key];
    if (val && typeof val === 'object') {
      const node = val as Record<string, unknown>;
      const item: NavItem = {
        label: typeof node['label'] === 'string' ? node['label'] : key
      };

      if (typeof node['path'] === 'string') {
        item.path = node['path'];
      }

      const childKeys = Object.keys(node).filter(k => k !== 'label' && k !== 'path');
      if (childKeys.length > 0) {
        item.children = parseNavPath(node);
      }

      items.push(item);
    }
  }

  return items;
}
