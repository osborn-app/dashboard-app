"use client";
import React, { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn, formatRupiah } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty, isNull, isString } from "lodash";
import { useDebounce } from "use-debounce";
import { Select as AntdSelect, ConfigProvider, DatePicker, Space } from "antd";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSidebar } from "@/hooks/useSidebar";
import dayjs, { Dayjs } from "dayjs";
import locale from "antd/locale/id_ID";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NumericFormat } from "react-number-format";
import "dayjs/locale/id";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  User,
  Car,
  Package,
  Building,
  CreditCard,
  Truck,
  ShoppingCart,
  Database,
  Settings,
  Plus,
  Minus,
  Trash2,
  Edit,
  Eye,
  Save,
  X,
} from "lucide-react";
