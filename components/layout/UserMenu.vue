<script setup lang="ts">
import { LogOut, User, Package, Settings, Heart, LayoutDashboard } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

// Avatar options mapping
const avatarMap: Record<string, string> = {
  default: "👤",
  "gamer-1": "🎮",
  "gamer-2": "🕹️",
  "tech-1": "💻",
  "tech-2": "🖥️",
  "robot-1": "🤖",
  "robot-2": "⚡",
  "abstract-1": "🔵",
  "abstract-2": "🟣",
};

// Fetch user's avatar + admin flag from profile
const avatarId = ref("default");
const isAdmin = ref(false);

const fetchUserAvatar = async () => {
  if (!user.value?.id) return;
  try {
    const { data } = await client
      .from("profiles")
      .select("avatar_id, is_admin")
      .eq("id", user.value.id)
      .single();
    if (data) {
      if ((data as any).avatar_id) avatarId.value = (data as any).avatar_id;
      isAdmin.value = !!(data as any).is_admin;
    }
  } catch (e) {
    // Fallback to default
  }
};

// Fetch avatar on mount
onMounted(() => {
  fetchUserAvatar();
});

// Watch for user changes
watch(
  user,
  () => {
    if (user.value?.id) {
      fetchUserAvatar();
    }
  },
  { immediate: true }
);

// Get avatar emoji
const avatarEmoji = computed(() => avatarMap[avatarId.value] || "👤");

// Get user's initials from full_name or email
const userInitials = computed(() => {
  if (!user.value) return "";

  const fullName = user.value.user_metadata?.full_name as string | undefined;
  if (fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  }

  // Fallback to email
  const email = user.value.email;
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }

  return "U";
});

const displayName = computed(() => {
  if (!user.value) return "";
  return user.value.user_metadata?.full_name || user.value.email || "User";
});

const handleLogout = async () => {
  await client.auth.signOut();
  router.push("/");
};
</script>

<template>
  <ClientOnly>
    <div class="flex items-center">
      <!-- Logged In: Avatar with Dropdown -->
      <DropdownMenu v-if="user">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            class="relative h-9 w-9 rounded-full hover:bg-white/10"
          >
            <Avatar
              class="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors"
            >
              <AvatarFallback
                class="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-lg"
              >
                {{ avatarEmoji }}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          class="w-56 bg-background/95 backdrop-blur-xl border-white/10"
        >
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">
                {{ user.user_metadata?.full_name || "User" }}
              </p>
              <p class="text-xs leading-none text-muted-foreground">
                {{ user.email }}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator class="bg-white/10" />
          <template v-if="isAdmin">
            <DropdownMenuItem
              @click="router.push('/admin')"
              class="cursor-pointer focus:bg-white/10 text-primary focus:text-primary"
            >
              <LayoutDashboard class="mr-2 h-4 w-4" />
              Admin Panel
            </DropdownMenuItem>
            <DropdownMenuSeparator class="bg-white/10" />
          </template>
          <DropdownMenuItem
            @click="router.push('/account')"
            class="cursor-pointer focus:bg-white/10"
          >
            <User class="mr-2 h-4 w-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            @click="router.push('/account/orders')"
            class="cursor-pointer focus:bg-white/10"
          >
            <Package class="mr-2 h-4 w-4" />
            My Orders
          </DropdownMenuItem>
          <DropdownMenuItem
            @click="router.push('/account/wishlist')"
            class="cursor-pointer focus:bg-white/10"
          >
            <Heart class="mr-2 h-4 w-4" />
            Favorites
          </DropdownMenuItem>
          <DropdownMenuItem
            @click="router.push('/account/settings')"
            class="cursor-pointer focus:bg-white/10"
          >
            <Settings class="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator class="bg-white/10" />
          <DropdownMenuItem
            @click="handleLogout"
            class="cursor-pointer focus:bg-white/10 text-destructive focus:text-destructive"
          >
            <LogOut class="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <!-- Logged Out: Login / Sign Up Button -->
      <div v-if="!user" class="flex items-center gap-1 min-[380px]:gap-2">
        <Button
          variant="ghost"
          size="sm"
          class="px-2 text-foreground/70 hover:text-foreground hover:bg-white/10 min-[380px]:px-3"
          as-child
        >
          <NuxtLink to="/auth/login">Login</NuxtLink>
        </Button>
        <Button
          size="sm"
          class="hidden bg-primary/90 hover:bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all min-[380px]:inline-flex"
          as-child
        >
          <NuxtLink to="/auth/register">Sign Up</NuxtLink>
        </Button>
      </div>
    </div>
  </ClientOnly>
</template>
