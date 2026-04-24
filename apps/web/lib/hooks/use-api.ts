// ============================================================
// REACT QUERY HOOKS — data fetching for all dashboard pages
// ============================================================
"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

async function poster<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

async function patcher<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

// --- Buyer hooks ---
export function useBuyerStats() {
  return useQuery({
    queryKey: ['buyer-stats'],
    queryFn: () => fetcher('/api/buyer/dashboard/stats'),
    refetchInterval: 30_000,
  })
}

export function useBuyerRequirements(page = 1) {
  return useQuery({
    queryKey: ['buyer-requirements', page],
    queryFn: () => fetcher(`/api/buyer/requirements?page=${page}`),
  })
}

export function useBuyerRequirementDetail(id: string) {
  return useQuery({
    queryKey: ['buyer-requirement', id],
    queryFn: () => fetcher(`/api/buyer/requirements/${id}`),
    enabled: !!id,
  })
}

export function useCreateRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) => poster('/api/buyer/requirements', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['buyer-requirements'] }) },
  })
}

export function useUpdateRequirement(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) => patcher(`/api/buyer/requirements/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buyer-requirements'] })
      qc.invalidateQueries({ queryKey: ['buyer-requirement', id] })
    },
  })
}

export function useDeleteRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/buyer/requirements/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      return json.data
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['buyer-requirements'] }) },
  })
}

// --- Vendor hooks ---
export function useVendorStats() {
  return useQuery({
    queryKey: ['vendor-stats'],
    queryFn: () => fetcher('/api/vendor/dashboard/stats'),
    refetchInterval: 30_000,
  })
}

export function useMarketplace(page = 1, sort = 'newest') {
  return useQuery({
    queryKey: ['marketplace', page, sort],
    queryFn: () => fetcher(`/api/vendor/marketplace?page=${page}&sort=${sort}`),
  })
}

export function useMarketplaceDetail(id: string) {
  return useQuery({
    queryKey: ['marketplace-detail', id],
    queryFn: () => fetcher(`/api/vendor/marketplace/${id}`),
    enabled: !!id,
  })
}

export function useVendorProposals() {
  return useQuery({
    queryKey: ['vendor-proposals'],
    queryFn: () => fetcher('/api/vendor/proposals'),
  })
}

export function useSubmitProposal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) => poster('/api/vendor/proposals', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-proposals'] })
      qc.invalidateQueries({ queryKey: ['marketplace'] })
    },
  })
}

export function useVendorProfile() {
  return useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => fetcher('/api/vendor/profile'),
  })
}

export function useUpdateVendorProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: unknown) => patcher('/api/vendor/profile', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendor-profile'] }) },
  })
}

export function useVendorCertifications() {
  return useQuery({
    queryKey: ['vendor-certifications'],
    queryFn: () => fetcher('/api/vendor/certifications'),
  })
}

export function useTrustEvents() {
  return useQuery({
    queryKey: ['trust-events'],
    queryFn: () => fetcher('/api/vendor/trust/events'),
  })
}

// --- Deal hooks ---
export function useDealDetail(id: string) {
  return useQuery({
    queryKey: ['deal', id],
    queryFn: () => fetcher(`/api/deals/${id}`),
    enabled: !!id,
    refetchInterval: 10_000,
  })
}

export function useCreateDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { proposal_id: string }) => poster('/api/deals/create', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buyer-requirements'] })
      qc.invalidateQueries({ queryKey: ['buyer-stats'] })
    },
  })
}

export function useDealTransition(dealId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { action: string; note?: string }) =>
      poster(`/api/deals/${dealId}/transition`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deal', dealId] }) },
  })
}

export function useConsentReveal(dealId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => poster(`/api/deals/${dealId}/consent-reveal`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deal', dealId] }) },
  })
}

// --- Notifications hook ---
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      const json = await res.json()
      return json.data || []
    },
    refetchInterval: 15_000,
  })
}

// --- Deal closing, reviews, and price hooks ---
export function useCloseDeal(dealId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => poster(`/api/deals/${dealId}/close`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deal', dealId] }) },
  })
}

export function useSubmitReview(dealId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { rating: number; comment?: string }) =>
      poster(`/api/deals/${dealId}/review`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deal', dealId] })
      qc.invalidateQueries({ queryKey: ['deal-reviews', dealId] })
    },
  })
}

export function useUpdateDealPrice(dealId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { new_price: number }) =>
      patcher(`/api/deals/${dealId}/price`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deal', dealId] }) },
  })
}

export function useDealReviews(dealId: string) {
  return useQuery({
    queryKey: ['deal-reviews', dealId],
    queryFn: () => fetcher<any[]>(`/api/deals/${dealId}/reviews`),
    enabled: !!dealId,
  })
}

