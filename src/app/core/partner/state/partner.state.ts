import { Partner } from '../models/partner.model';

export interface PartnerState {
  partners: Partner[];
  selectedPartner: Partner | null;
  loading: boolean;
  error: string | null;
}

export const initialPartnerState: PartnerState = {
  partners: [],
  selectedPartner: null,
  loading: false,
  error: null,
};
