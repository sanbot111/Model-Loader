export interface FormDataType {
  gender: string;
  ageGroup: string;
  regionEthnicity: string;
  skinTone: string;
  hairStyle: string;
  marketingArchetype: string;
  bodyType: string;
}

export interface ModelData {
  seed: string;
  imageUrls: {
    straight: string;
    left: string;
    right: string;
  };
  prompts: {
    straightPrompt: string;
    leftPrompt: string;
    rightPrompt: string;
  };
  formData: FormDataType;
}
