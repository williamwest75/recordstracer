import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Globe, Users, BarChart3 } from "lucide-react";
import type { QueryMode } from "./types";

interface SearchFormProps {
  keyword: string;
  setKeyword: (v: string) => void;
  mode: QueryMode;
  setMode: (v: QueryMode) => void;
  usOnly: boolean;
  setUsOnly: (v: boolean) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchForm = ({ keyword, setKeyword, mode, setMode, usOnly, setUsOnly, isLoading, onSubmit }: SearchFormProps) => (
  <>
    <Tabs value={mode} onValueChange={(v) => setMode(v as QueryMode)} className="mb-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="events" className="gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Events
        </TabsTrigger>
        <TabsTrigger value="gkg" className="gap-1.5">
          <Users className="h-3.5 w-3.5" /> Knowledge Graph
        </TabsTrigger>
        <TabsTrigger value="mentions" className="gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Mentions
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <form onSubmit={onSubmit} className="flex gap-2 mb-4">
      <Input
        placeholder={
          mode === "events"
            ? "Search by actor name…"
            : mode === "gkg"
            ? "Search by URL keyword…"
            : "Search by source name…"
        }
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={!keyword.trim() || isLoading}>
        <Search className="h-4 w-4 mr-1" /> Search
      </Button>
    </form>

    <div className="flex items-center gap-2 mb-8">
      <Switch id="us-only" checked={usOnly} onCheckedChange={setUsOnly} />
      <Label htmlFor="us-only" className="text-sm text-muted-foreground cursor-pointer">
        US sources only
      </Label>
    </div>
  </>
);

export default SearchForm;
